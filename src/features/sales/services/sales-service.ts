import {
  SalesRepository,
  CreateInvoiceInput,
  SalesFilter,
} from '../repositories/sales-repository';
import { ProductRepository } from '../../products/repositories/product-repository';
import { AuditService } from '../../audit/services/audit-service';

export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  availableStock: number;
}

export interface CreateSaleInput {
  items: CartItem[];
  customerId?: string;
  invoiceDiscount: number;
  taxRate: number;
  paymentType: 'cash' | 'card' | 'transfer' | 'credit';
  paidAmount: number;
  userId: string;
  branchId: string;
  deviceId: string;
}

export class SalesService {
  /**
   * Create a complete sale with validation, calculation, persistence, and audit.
   * This is the primary business workflow for the POS module.
   */
  static async createSale(input: CreateSaleInput) {
    // Step 1: Validate
    await this.validateSale(input);

    // Step 2: Calculate
    const calculations = this.calculateTotals(input);

    // Step 3: Persist (transaction-safe)
    const invoiceInput: CreateInvoiceInput = {
      customerId: input.customerId,
      totalAmount: calculations.subtotal,
      discountAmount: calculations.totalDiscount,
      taxAmount: calculations.taxAmount,
      payableAmount: calculations.grandTotal,
      paidAmount: input.paidAmount,
      changeAmount: calculations.changeAmount,
      paymentStatus: this.determinePaymentStatus(
        input.paidAmount,
        calculations.grandTotal,
        input.paymentType,
      ),
      paymentType: input.paymentType,
      userId: input.userId,
      branchId: input.branchId,
      deviceId: input.deviceId,
      items: input.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
      })),
    };

    const result = await SalesRepository.createInvoice(invoiceInput);

    // Step 4: Audit log
    await AuditService.log({
      userId: input.userId,
      action: 'SALE_CREATED',
      entity: 'invoice',
      entityId: result.invoice.id,
      newValue: {
        invoiceNumber: result.invoice.invoiceNumber,
        payableAmount: result.invoice.payableAmount,
        itemCount: result.items.length,
        paymentType: result.invoice.paymentType,
        customerId: result.invoice.customerId,
      },
      branchId: input.branchId,
      deviceId: input.deviceId,
    });

    return result;
  }

  /**
   * Validate all business rules before creating a sale.
   */
  private static async validateSale(input: CreateSaleInput): Promise<void> {
    if (!input.items || input.items.length === 0) {
      throw new Error('Cannot create a sale with no items.');
    }

    // Validate stock availability for each item
    const stockChecks = await Promise.all(
      input.items.map(async (item) => {
        const currentStock = await ProductRepository.getCurrentStock(
          item.productId,
        );
        return { item, currentStock };
      }),
    );

    stockChecks.forEach(({ item, currentStock }) => {
      if (currentStock < item.quantity) {
        throw new Error(
          `Insufficient stock for "${item.productName}". Available: ${currentStock}, Requested: ${item.quantity}`,
        );
      }
    });

    // Credit sales require a customer
    if (input.paymentType === 'credit' && !input.customerId) {
      throw new Error('Credit sales require a customer to be selected.');
    }
  }

  /**
   * Calculate all financial totals for the sale.
   */
  static calculateTotals(input: CreateSaleInput) {
    // Line totals after item discounts
    const lineItems = input.items.map((item) => {
      const lineSubtotal = item.unitPrice * item.quantity;
      const lineTotal = lineSubtotal - (item.discount || 0);
      return { ...item, lineSubtotal, lineTotal };
    });

    const subtotal = lineItems.reduce(
      (sum, item) => sum + item.lineSubtotal,
      0,
    );
    const itemDiscountTotal = lineItems.reduce(
      (sum, item) => sum + (item.discount || 0),
      0,
    );
    const totalDiscount = itemDiscountTotal + (input.invoiceDiscount || 0);
    const afterDiscount = subtotal - totalDiscount;
    const taxAmount = afterDiscount * ((input.taxRate || 0) / 100);
    const grandTotal = afterDiscount + taxAmount;

    // For credit sales, paid amount can be 0
    const paidAmount =
      input.paymentType === 'credit' ? input.paidAmount : input.paidAmount;
    const changeAmount = Math.max(0, paidAmount - grandTotal);

    return {
      subtotal,
      itemDiscountTotal,
      totalDiscount,
      taxAmount,
      grandTotal: Math.round(grandTotal * 100) / 100,
      changeAmount: Math.round(changeAmount * 100) / 100,
      lineItems,
    };
  }

  /**
   * Determine payment status based on amounts.
   */
  private static determinePaymentStatus(
    paidAmount: number,
    grandTotal: number,
    paymentType: string,
  ): 'unpaid' | 'partial' | 'paid' {
    if (paymentType === 'credit' && paidAmount === 0) return 'unpaid';
    if (paidAmount >= grandTotal) return 'paid';
    if (paidAmount > 0) return 'partial';
    return 'unpaid';
  }

  /**
   * Cancel a sale — reverses inventory and logs audit.
   */
  static async cancelSale(
    invoiceId: string,
    userId: string,
    branchId: string,
    deviceId: string,
  ) {
    // Get invoice before cancellation for audit
    const invoice = await SalesRepository.getInvoice(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found.');
    }
    if (invoice.status === 'cancelled') {
      throw new Error('Invoice is already cancelled.');
    }

    const result = await SalesRepository.cancelInvoice(
      invoiceId,
      userId,
      branchId,
    );

    await AuditService.log({
      userId,
      action: 'SALE_CANCELLED',
      entity: 'invoice',
      entityId: invoiceId,
      oldValue: {
        status: 'active',
        invoiceNumber: invoice.invoiceNumber,
        payableAmount: invoice.payableAmount,
      },
      newValue: { status: 'cancelled' },
      branchId,
      deviceId,
    });

    return result;
  }

  /**
   * Get paginated sales list.
   */
  static async getSales(filters: SalesFilter) {
    return SalesRepository.getInvoices(filters);
  }

  /**
   * Get single sale with items.
   */
  static async getSale(id: string) {
    return SalesRepository.getInvoice(id);
  }

  /**
   * Get daily summary for the POS status bar.
   */
  static async getDailySummary(branchId: string) {
    const today = new Date().toISOString().split('T')[0];
    return SalesRepository.getDailySummary(branchId, today);
  }

  /**
   * Get the next invoice number preview.
   */
  static async getNextInvoiceNumber(branchId: string, deviceId: string) {
    return SalesRepository.getNextInvoiceNumber(branchId, deviceId);
  }
}
