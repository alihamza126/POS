import { eq, and } from 'drizzle-orm';
import { db } from '../../../database/sqlite/db';
import { purchaseInvoices, supplierPayments } from '../../../database/schema/suppliers';

export class SupplierLedgerService {
  static async getSupplierLedger(supplierId: string) {
    // 1. Fetch all active purchase invoices for the supplier
    const invoices = db
      .select()
      .from(purchaseInvoices)
      .where(
        and(eq(purchaseInvoices.supplierId, supplierId), eq(purchaseInvoices.status, 'active')),
      )
      .all();

    // 2. Fetch all payments to the supplier
    const payments = db
      .select()
      .from(supplierPayments)
      .where(eq(supplierPayments.supplierId, supplierId))
      .all();

    // 3. Combine and sort by date
    // Following the user's reference invoice system:
    // Purchases are DEBITS (payableAmount) and Payments are CREDITS
    const ledgerEntries: any[] = [];

    invoices.forEach((inv) => {
      // The total amount of the purchase invoice is what we owe/buy (Debit)
      ledgerEntries.push({
        id: `inv-${inv.id}`,
        type: 'invoice',
        date: inv.purchaseDate || inv.createdAt,
        number: inv.invoiceNumber,
        memo: `Purchase - ${inv.paymentType.toUpperCase()}${inv.memo ? ' (' + inv.memo + ')' : ''}`,
        debit: inv.payableAmount,
        credit: 0,
      });

      // If we paid something at the time of purchase, it's a Credit
      if (inv.paidAmount > 0) {
        ledgerEntries.push({
          id: `pay-inv-${inv.id}`,
          type: 'payment',
          date: inv.purchaseDate || inv.createdAt, // Same date as invoice
          number: inv.invoiceNumber,
          memo: `Payment at Purchase (${inv.paymentType.toUpperCase()})`,
          debit: 0,
          credit: inv.paidAmount,
        });
      }
    });

    payments.forEach((pay) => {
      ledgerEntries.push({
        id: `pay-${pay.id}`,
        type: 'payment',
        date: pay.paymentDate || pay.createdAt,
        number: pay.referenceNo || 'PAY-' + pay.id.substring(0, 8),
        memo: `Payment - ${pay.paymentMethod.toUpperCase()}${pay.note ? ' (' + pay.note + ')' : ''}`,
        debit: 0,
        credit: pay.amount,
      });
    });

    // Sort by date ascending
    ledgerEntries.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    // 4. Calculate running balance
    let runningBalance = 0;
    const history = ledgerEntries.map((entry) => {
      runningBalance += entry.debit - entry.credit;
      return {
        ...entry,
        balance: runningBalance,
      };
    });

    return history.reverse(); // Newest first for UI
  }

  static async getSupplierSummary(supplierId: string) {
    const history = await this.getSupplierLedger(supplierId);

    const summary = {
      currentBalance: history.length > 0 ? history[0].balance : 0,
      totalPurchases: 0,
      totalPayments: 0,
      transactionCount: history.length,
      lastTransaction: history.length > 0 ? history[0].date : null,
    };

    // Calculate totals from the flat list (history is reversed, so we just iterate)
    history.forEach((entry) => {
      if (entry.type === 'invoice') {
        summary.totalPurchases += entry.debit;
      } else {
        summary.totalPayments += entry.credit;
      }
    });

    return summary;
  }
}

export default SupplierLedgerService;
