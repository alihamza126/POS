import { eq, and } from 'drizzle-orm';
import { db } from '../../../database/sqlite/db';
import { invoices } from '../../../database/schema/sales';
import { customerPayments } from '../../../database/schema/customers';

export interface LedgerEntry {
  id: string;
  type: 'invoice' | 'payment';
  date: string;
  number: string;
  memo: string;
  debit: number;
  credit: number;
  balance: number;
}

export class LedgerService {
  static async getCustomerLedger(customerId: string): Promise<LedgerEntry[]> {
    // 1. Fetch all invoices for this customer
    const customerInvoices = db
      .select()
      .from(invoices)
      .where(
        and(eq(invoices.customerId, customerId), eq(invoices.status, 'active')),
      )
      .all();

    // 2. Fetch all payments for this customer
    const payments = db
      .select()
      .from(customerPayments)
      .where(eq(customerPayments.customerId, customerId))
      .all();

    // 3. Combine and sort by date
    const entries: Omit<LedgerEntry, 'balance'>[] = [
      ...customerInvoices.map((inv) => ({
        id: inv.id,
        type: 'invoice' as const,
        date: inv.createdAt as string,
        number: inv.invoiceNumber,
        memo: 'Sales Invoice',
        debit: inv.payableAmount || inv.totalAmount,
        credit: 0,
      })),
      ...customerInvoices
        .filter((inv) => inv.paidAmount > 0)
        .map((inv) => ({
          id: `${inv.id}_payment`,
          type: 'payment' as const,
          date: inv.createdAt as string,
          number: inv.invoiceNumber,
          memo: `Payment at Sale (${inv.paymentType || 'Cash'})`,
          debit: 0,
          credit: inv.paidAmount,
        })),
      ...payments.map((p) => ({
        id: p.id,
        type: 'payment' as const,
        date: p.createdAt as string,
        number: p.referenceNo || p.id.slice(0, 8),
        memo: p.note || `Payment via ${p.paymentMethod}`,
        debit: 0,
        credit: p.amount,
      })),
    ];

    // Sort by date ascending to calculate running balance correctly
    entries.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    // 4. Calculate running balance
    let runningBalance = 0;
    const ledgerWithBalance: LedgerEntry[] = entries.map((entry) => {
      runningBalance += entry.debit - entry.credit;
      return {
        ...entry,
        balance: runningBalance,
      };
    });

    // Return descending for UI display (newest first)
    return ledgerWithBalance.reverse();
  }

  static async getCustomerSummary(customerId: string) {
    const ledger = await this.getCustomerLedger(customerId);

    const totalInvoices = ledger
      .filter((e) => e.type === 'invoice')
      .reduce((sum, e) => sum + e.debit, 0);
    const totalPayments = ledger
      .filter((e) => e.type === 'payment')
      .reduce((sum, e) => sum + e.credit, 0);
    const currentBalance = totalInvoices - totalPayments;

    const lastTransaction = ledger.length > 0 ? ledger[0].date : null;

    return {
      totalInvoices,
      totalPayments,
      currentBalance,
      lastTransaction,
      transactionCount: ledger.length,
    };
  }
}

export default LedgerService;
