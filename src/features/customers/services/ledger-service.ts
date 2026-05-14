import { eq, and, sql } from 'drizzle-orm';
import { db } from '../../../database/sqlite/db';
import { invoices } from '../../../database/schema/sales';
import { customerPayments } from '../../../database/schema/customers';

export class LedgerService {
  static async getCustomerLedger(customerId: string) {
    // 1. Fetch all active invoices for the customer
    const customerInvoices = db
      .select()
      .from(invoices)
      .where(
        and(eq(invoices.customerId, customerId), eq(invoices.status, 'active')),
      )
      .all();

    // 2. Fetch all payments for the customer
    const customerPaymentsList = db
      .select()
      .from(customerPayments)
      .where(eq(customerPayments.customerId, customerId))
      .all();

    // 3. Combine and sort by date
    // Each invoice creates a DEBIT (payableAmount) and potentially a CREDIT (paidAmount)
    const ledgerEntries: any[] = [];

    customerInvoices.forEach((inv) => {
      // The total amount of the invoice is what the customer "owes" (Debit)
      ledgerEntries.push({
        id: `inv-${inv.id}`,
        type: 'invoice',
        date: inv.createdAt,
        number: inv.invoiceNumber,
        memo: `Invoice - ${inv.paymentType.toUpperCase()}`,
        debit: inv.payableAmount,
        credit: 0,
      });

      // If they paid something at the time of sale, it's a Credit
      if (inv.paidAmount > 0) {
        ledgerEntries.push({
          id: `pay-inv-${inv.id}`,
          type: 'payment',
          date: inv.createdAt, // Same date as invoice
          number: inv.invoiceNumber,
          memo: `Payment at Sale (${inv.paymentType.toUpperCase()})`,
          debit: 0,
          credit: inv.paidAmount,
        });
      }
    });

    customerPaymentsList.forEach((pay) => {
      ledgerEntries.push({
        id: `pay-${pay.id}`,
        type: 'payment',
        date: pay.createdAt,
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

  static async getCustomerSummary(customerId: string) {
    const history = await this.getCustomerLedger(customerId);

    const summary = {
      currentBalance: history.length > 0 ? history[0].balance : 0,
      totalInvoices: 0,
      totalPayments: 0,
      transactionCount: history.length,
      lastTransaction: history.length > 0 ? history[0].date : null,
    };

    // Calculate totals from the flat list (history is reversed, so we just iterate)
    history.forEach((entry) => {
      if (entry.type === 'invoice') {
        summary.totalInvoices += entry.debit;
      } else {
        summary.totalPayments += entry.credit;
      }
    });

    return summary;
  }
}
