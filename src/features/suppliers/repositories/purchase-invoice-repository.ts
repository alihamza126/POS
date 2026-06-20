import { eq, desc, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../../database/sqlite/db';
import {
  purchaseInvoices,
  purchaseInvoiceItems,
  supplierPayments,
} from '../../../database/schema/suppliers';
import { stockMovements } from '../../../database/schema/inventory';
import { syncService } from '../../../sync/services/sync-service';

export class PurchaseInvoiceRepository {
  static async create(
    invoiceData: any,
    items: any[],
    userId: string,
    branchId: string,
    deviceId: string,
  ) {
    const invoiceId = uuidv4();

    // Calculate totals from items
    const totalAmount = items.reduce(
      (sum: number, item: any) => sum + item.totalPrice,
      0,
    );
    const discountAmount = invoiceData.discountAmount || 0;
    const taxAmount = invoiceData.taxAmount || 0;
    const payableAmount = totalAmount - discountAmount + taxAmount;
    const paidAmount = invoiceData.paidAmount || 0;

    let paymentStatus: 'unpaid' | 'partial' | 'paid' = 'unpaid';
    if (paidAmount >= payableAmount) {
      paymentStatus = 'paid';
    } else if (paidAmount > 0) {
      paymentStatus = 'partial';
    }

    const invoice = db
      .insert(purchaseInvoices)
      .values({
        id: invoiceId,
        invoiceNumber: invoiceData.invoiceNumber,
        supplierId: invoiceData.supplierId,
        totalAmount,
        discountAmount,
        taxAmount,
        payableAmount,
        paidAmount,
        paymentStatus,
        paymentType: invoiceData.paymentType || 'credit',
        status: 'active',
        memo: invoiceData.memo || null,
        userId,
        branchId,
        deviceId,
        purchaseDate: invoiceData.purchaseDate || null,
      })
      .returning()
      .get();

    // Insert items
    const insertedItems = items.map((item: any) => {
      const itemId = uuidv4();
      return db
        .insert(purchaseInvoiceItems)
        .values({
          id: itemId,
          purchaseInvoiceId: invoiceId,
          productId: item.productId || null,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          discount: item.discount || 0,
        })
        .returning()
        .get();
    });

    // Create stock movements for items that have a productId (inventory tracking)
    items.forEach((item: any) => {
      if (item.productId) {
        const movementId = uuidv4();
        db.insert(stockMovements)
          .values({
            id: movementId,
            productId: item.productId,
            type: 'purchase',
            quantity: item.quantity, // Positive for incoming stock
            referenceId: invoiceId,
            reason: `Purchase from supplier - Invoice #${invoiceData.invoiceNumber}`,
            userId,
            branchId,
          })
          .run();
      }
    });

    // Create supplier payment if there is a paid amount
    if (paidAmount > 0) {
      const paymentId = uuidv4();
      const paymentData = {
        id: paymentId,
        supplierId: invoiceData.supplierId,
        amount: paidAmount,
        paymentDate: invoiceData.purchaseDate || new Date().toISOString(),
        paymentMethod: invoiceData.paymentType || 'cash',
        referenceNumber: invoiceData.invoiceNumber,
        memo: `Payment for Purchase Invoice #${invoiceData.invoiceNumber}`,
        userId,
        branchId,
        deviceId,
      };

      const payment = db.insert(supplierPayments).values(paymentData).returning().get();

      syncService
        .addToQueue('supplier_payments', paymentId, 'create', payment)
        .catch(console.error);
    }

    // Add to sync queue
    syncService
      .addToQueue('purchase_invoices', invoiceId, 'create', {
        ...invoice,
        items: insertedItems,
      })
      .catch(console.error);

    return { ...invoice, items: insertedItems };
  }

  /**
   * Creates a simple purchase entry without a full item breakdown.
   * Used for quick ledger entries (just amount + date + memo).
   * No stock movements are created — purely financial tracking.
   */
  static async createSimple(data: {
    supplierId: string;
    amount: number;
    purchaseDate?: string;
    invoiceNumber?: string;
    paymentType: string;
    memo?: string;
    userId: string;
    branchId: string;
    deviceId: string;
  }) {
    const invoiceId = uuidv4();
    const invoiceNumber =
      data.invoiceNumber || `PUR-${Date.now().toString().slice(-6)}`;

    // For simple purchases, amount = totalAmount = payableAmount
    // If not credit, paidAmount = amount (paid on the spot)
    const isCredit = data.paymentType === 'credit';
    const paidAmount = isCredit ? 0 : data.amount;
    const paymentStatus: 'unpaid' | 'partial' | 'paid' = isCredit ? 'unpaid' : 'paid';

    const invoice = db
      .insert(purchaseInvoices)
      .values({
        id: invoiceId,
        invoiceNumber,
        supplierId: data.supplierId,
        totalAmount: data.amount,
        discountAmount: 0,
        taxAmount: 0,
        payableAmount: data.amount,
        paidAmount,
        paymentStatus,
        paymentType: data.paymentType || 'credit',
        status: 'active',
        memo: data.memo || null,
        userId: data.userId,
        branchId: data.branchId,
        deviceId: data.deviceId,
        purchaseDate: data.purchaseDate || null,
      })
      .returning()
      .get();

    // No stock movements for simple purchase entries (no product linkage)

    // Create supplier payment if there is a paid amount
    if (paidAmount > 0) {
      const paymentId = uuidv4();
      const paymentData = {
        id: paymentId,
        supplierId: data.supplierId,
        amount: paidAmount,
        paymentDate: data.purchaseDate || new Date().toISOString(),
        paymentMethod: data.paymentType || 'cash',
        referenceNumber: invoiceNumber,
        memo: `Payment for Simple Purchase #${invoiceNumber}`,
        userId: data.userId,
        branchId: data.branchId,
        deviceId: data.deviceId,
      };

      const payment = db.insert(supplierPayments).values(paymentData).returning().get();

      syncService
        .addToQueue('supplier_payments', paymentId, 'create', payment)
        .catch(console.error);
    }

    // Add to sync queue
    syncService
      .addToQueue('purchase_invoices', invoiceId, 'create', invoice)
      .catch(console.error);

    return invoice;
  }

  static async findById(id: string) {
    const invoice = db
      .select()
      .from(purchaseInvoices)
      .where(eq(purchaseInvoices.id, id))
      .get();

    if (!invoice) return null;

    const items = db
      .select()
      .from(purchaseInvoiceItems)
      .where(eq(purchaseInvoiceItems.purchaseInvoiceId, id))
      .all();

    return { ...invoice, items };
  }

  static async findAllBySupplierId(supplierId: string) {
    return db
      .select()
      .from(purchaseInvoices)
      .where(eq(purchaseInvoices.supplierId, supplierId))
      .orderBy(desc(purchaseInvoices.createdAt))
      .all();
  }

  static async findAllItemsBySupplierId(supplierId: string) {
    return db
      .select({
        id: purchaseInvoiceItems.id,
        purchaseInvoiceId: purchaseInvoiceItems.purchaseInvoiceId,
        productId: purchaseInvoiceItems.productId,
        productName: purchaseInvoiceItems.productName,
        quantity: purchaseInvoiceItems.quantity,
        unitPrice: purchaseInvoiceItems.unitPrice,
        totalPrice: purchaseInvoiceItems.totalPrice,
        discount: purchaseInvoiceItems.discount,
        invoiceNumber: purchaseInvoices.invoiceNumber,
        purchaseDate: purchaseInvoices.purchaseDate,
      })
      .from(purchaseInvoiceItems)
      .innerJoin(
        purchaseInvoices,
        eq(purchaseInvoiceItems.purchaseInvoiceId, purchaseInvoices.id)
      )
      .where(eq(purchaseInvoices.supplierId, supplierId))
      .orderBy(desc(purchaseInvoices.purchaseDate))
      .all();
  }

  static async cancel(id: string) {
    const result = db
      .update(purchaseInvoices)
      .set({
        status: 'cancelled',
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(purchaseInvoices.id, id))
      .returning()
      .get();

    return result;
  }
}
