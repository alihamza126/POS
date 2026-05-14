import { eq, and, like, or, sql, desc, count, gte, lte } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../../database/sqlite/db';
import { invoices, invoiceItems } from '../../../database/schema/sales';
import { stockMovements, products } from '../../../database/schema/inventory';

export interface SalesFilter {
  query?: string;
  branchId: string;
  status?: 'active' | 'cancelled' | 'returned';
  paymentStatus?: 'unpaid' | 'partial' | 'paid';
  dateFrom?: string;
  dateTo?: string;
  customerId?: string;
  limit?: number;
  offset?: number;
}

export interface InvoiceItemInput {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
}

export interface CreateInvoiceInput {
  customerId?: string;
  totalAmount: number;
  discountAmount: number;
  taxAmount: number;
  payableAmount: number;
  paidAmount: number;
  changeAmount: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  paymentType: 'cash' | 'card' | 'transfer' | 'credit';
  userId: string;
  branchId: string;
  deviceId: string;
  items: InvoiceItemInput[];
}

export class SalesRepository {
  /**
   * Generate the next deterministic invoice number.
   * Format: BR01-DEV01-000001
   */
  static async getNextInvoiceNumber(
    branchId: string,
    deviceId: string,
  ): Promise<string> {
    const branchPrefix = `BR${branchId.slice(0, 2).toUpperCase().padStart(2, '0')}`;
    const devicePrefix = `DEV${deviceId.slice(0, 2).toUpperCase().padStart(2, '0')}`;
    const prefix = `${branchPrefix}-${devicePrefix}-`;

    const lastInvoice = db
      .select({ invoiceNumber: invoices.invoiceNumber })
      .from(invoices)
      .where(like(invoices.invoiceNumber, `${prefix}%`))
      .orderBy(desc(invoices.invoiceNumber))
      .limit(1)
      .get();

    let nextSeq = 1;
    if (lastInvoice) {
      const parts = lastInvoice.invoiceNumber.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!Number.isNaN(lastSeq)) {
        nextSeq = lastSeq + 1;
      }
    }

    return `${prefix}${nextSeq.toString().padStart(6, '0')}`;
  }

  /**
   * Create a complete invoice with items and stock movements
   * within a single SQLite transaction.
   * This is the core financial operation — it must be atomic.
   */
  static async createInvoice(input: CreateInvoiceInput) {
    const invoiceId = uuidv4();
    const invoiceNumber = await this.getNextInvoiceNumber(
      input.branchId,
      input.deviceId,
    );

    // Use a transaction to ensure atomicity
    const result = db.transaction((tx) => {
      // 1. Insert invoice
      const createdInvoice = tx
        .insert(invoices)
        .values({
          id: invoiceId,
          invoiceNumber,
          customerId: input.customerId || null,
          totalAmount: input.totalAmount,
          discountAmount: input.discountAmount,
          taxAmount: input.taxAmount,
          payableAmount: input.payableAmount,
          paidAmount: input.paidAmount,
          changeAmount: input.changeAmount,
          paymentStatus: input.paymentStatus,
          paymentType: input.paymentType,
          status: 'active',
          userId: input.userId,
          branchId: input.branchId,
          deviceId: input.deviceId,
        })
        .returning()
        .get();

      // 2. Insert invoice items and create stock movements
      const createdItems = input.items.map((item) => {
        const itemId = uuidv4();
        const lineTotal = item.unitPrice * item.quantity - item.discount;

        const createdItem = tx
          .insert(invoiceItems)
          .values({
            id: itemId,
            invoiceId,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: lineTotal,
            discount: item.discount,
          })
          .returning()
          .get();

        // 3. Create stock movement (negative quantity for sale)
        tx.insert(stockMovements)
          .values({
            id: uuidv4(),
            productId: item.productId,
            type: 'sale',
            quantity: -item.quantity,
            referenceId: invoiceId,
            reason: `Sale: ${invoiceNumber}`,
            userId: input.userId,
            branchId: input.branchId,
          })
          .run();

        return { ...createdItem, productName: item.productName };
      });

      return { invoice: createdInvoice, items: createdItems };
    });

    return result;
  }

  /**
   * Get a single invoice with its items and product names.
   */
  static async getInvoice(id: string) {
    const invoice = db.select().from(invoices).where(eq(invoices.id, id)).get();

    if (!invoice) return null;

    const items = db
      .select({
        id: invoiceItems.id,
        productId: invoiceItems.productId,
        productName: products.name,
        quantity: invoiceItems.quantity,
        unitPrice: invoiceItems.unitPrice,
        totalPrice: invoiceItems.totalPrice,
        discount: invoiceItems.discount,
      })
      .from(invoiceItems)
      .leftJoin(products, eq(invoiceItems.productId, products.id))
      .where(eq(invoiceItems.invoiceId, id))
      .all();

    return { ...invoice, items };
  }

  /**
   * Get paginated list of invoices with filters.
   */
  static async getInvoices(filters: SalesFilter) {
    const {
      query,
      branchId,
      status,
      paymentStatus,
      dateFrom,
      dateTo,
      customerId,
      limit = 20,
      offset = 0,
    } = filters;

    let conditions = eq(invoices.branchId, branchId);

    if (query) {
      conditions = and(
        conditions,
        or(like(invoices.invoiceNumber, `%${query}%`)),
      )!;
    }

    if (status) {
      conditions = and(conditions, eq(invoices.status, status))!;
    }

    if (paymentStatus) {
      conditions = and(conditions, eq(invoices.paymentStatus, paymentStatus))!;
    }

    if (customerId) {
      conditions = and(conditions, eq(invoices.customerId, customerId))!;
    }

    if (dateFrom) {
      conditions = and(conditions, gte(invoices.createdAt, dateFrom))!;
    }

    if (dateTo) {
      conditions = and(conditions, lte(invoices.createdAt, dateTo))!;
    }

    const items = db
      .select()
      .from(invoices)
      .where(conditions)
      .orderBy(desc(invoices.createdAt))
      .limit(limit)
      .offset(offset)
      .all();

    const totalResult = db
      .select({ count: count() })
      .from(invoices)
      .where(conditions)
      .get();

    return {
      items,
      total: totalResult?.count || 0,
    };
  }

  /**
   * Cancel an invoice and reverse all stock movements.
   * Invoices are never deleted — only status changes.
   */
  static async cancelInvoice(id: string, userId: string, branchId: string) {
    return db.transaction((tx) => {
      // 1. Update invoice status
      const updated = tx
        .update(invoices)
        .set({
          status: 'cancelled',
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(invoices.id, id))
        .returning()
        .get();

      // 2. Get original items to reverse stock
      const items = tx
        .select()
        .from(invoiceItems)
        .where(eq(invoiceItems.invoiceId, id))
        .all();

      // 3. Create reverse stock movements (positive to restore)
      items.forEach((item) => {
        tx.insert(stockMovements)
          .values({
            id: uuidv4(),
            productId: item.productId,
            type: 'return',
            quantity: item.quantity, // Positive to restore
            referenceId: id,
            reason: `Invoice cancelled: ${updated.invoiceNumber}`,
            userId,
            branchId,
          })
          .run();
      });

      return updated;
    });
  }

  /**
   * Get invoices for a specific customer (for ledger integration).
   */
  static async getInvoicesByCustomer(customerId: string) {
    return db
      .select()
      .from(invoices)
      .where(
        and(eq(invoices.customerId, customerId), eq(invoices.status, 'active')),
      )
      .orderBy(desc(invoices.createdAt))
      .all();
  }

  /**
   * Get daily sales summary for the status bar.
   */
  static async getDailySummary(branchId: string, date: string) {
    const dayStart = `${date} 00:00:00`;
    const dayEnd = `${date} 23:59:59`;

    const result = db
      .select({
        totalSales: sql<number>`COALESCE(SUM(${invoices.payableAmount}), 0)`,
        invoiceCount: count(),
        cashTotal: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.paymentType} = 'cash' THEN ${invoices.payableAmount} ELSE 0 END), 0)`,
        cardTotal: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.paymentType} = 'card' THEN ${invoices.payableAmount} ELSE 0 END), 0)`,
        creditTotal: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.paymentType} = 'credit' THEN ${invoices.payableAmount} ELSE 0 END), 0)`,
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.branchId, branchId),
          eq(invoices.status, 'active'),
          gte(invoices.createdAt, dayStart),
          lte(invoices.createdAt, dayEnd),
        ),
      )
      .get();

    return {
      totalSales: result?.totalSales || 0,
      invoiceCount: result?.invoiceCount || 0,
      cashTotal: result?.cashTotal || 0,
      cardTotal: result?.cardTotal || 0,
      creditTotal: result?.creditTotal || 0,
    };
  }
}
