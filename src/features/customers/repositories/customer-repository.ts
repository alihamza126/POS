import { eq, and, like, or, sql, desc, count, isNull } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../../database/sqlite/db';
import { customers } from '../../../database/schema/customers';
import { invoices } from '../../../database/schema/sales';
import { customerPayments } from '../../../database/schema/customers';
import { syncService } from '../../../sync/services/sync-service';

export interface CustomerFilter {
  query?: string;
  branchId: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class CustomerRepository {
  static async create(data: any) {
    const id = uuidv4();
    const newCustomer = {
      ...data,
      id,
    };
    const result = await db.insert(customers).values(newCustomer).returning().get();
    
    // Add to sync queue
    syncService.addToQueue('customers', id, 'create', result).catch(console.error);
    
    return result;
  }

  static async update(id: string, data: any) {
    const {
      id: _id,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      ...updateData
    } = data;
    
    const result = await db
      .update(customers)
      .set({ ...updateData, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(customers.id, id))
      .returning()
      .get();

    // Add to sync queue
    syncService.addToQueue('customers', id, 'update', result).catch(console.error);

    return result;
  }

  static async softDelete(id: string) {
    const result = await db
      .update(customers)
      .set({
        deletedAt: sql`CURRENT_TIMESTAMP`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(customers.id, id))
      .returning()
      .get();

    // Add to sync queue
    syncService.addToQueue('customers', id, 'delete', result).catch(console.error);

    return result;
  }

  static async findById(id: string) {
    return db.select().from(customers).where(eq(customers.id, id)).get();
  }

  static async findAll(filters: CustomerFilter) {
    const {
      query,
      branchId,
      limit = 20,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    let conditions = and(
      eq(customers.branchId, branchId),
      isNull(customers.deletedAt),
    );

    if (query) {
      conditions = and(
        conditions,
        or(
          like(customers.name, `%${query}%`),
          like(customers.phone, `%${query}%`),
          like(customers.email, `%${query}%`),
          like(customers.companyName, `%${query}%`),
        ),
      );
    }

    let orderBy: any = desc(customers.createdAt);
    if (sortBy && (customers as any)[sortBy]) {
      orderBy =
        sortOrder === 'desc'
          ? desc((customers as any)[sortBy])
          : (customers as any)[sortBy];
    }

    // Subquery for invoice balance
    const invoiceBalanceSubquery = db
      .select({
        customerId: invoices.customerId,
        balance: sql<number>`SUM(${invoices.payableAmount} - ${invoices.paidAmount})`.as('invoice_balance'),
      })
      .from(invoices)
      .where(eq(invoices.status, 'active'))
      .groupBy(invoices.customerId)
      .as('inv_bal');

    // Subquery for payment total
    const paymentTotalSubquery = db
      .select({
        customerId: customerPayments.customerId,
        total: sql<number>`SUM(${customerPayments.amount})`.as('payment_total'),
      })
      .from(customerPayments)
      .groupBy(customerPayments.customerId)
      .as('pay_tot');

    // Join with customers to get items with balance
    const items = db
      .select({
        id: customers.id,
        name: customers.name,
        phone: customers.phone,
        email: customers.email,
        address: customers.address,
        companyName: customers.companyName,
        ntn: customers.ntn,
        branchId: customers.branchId,
        createdAt: customers.createdAt,
        updatedAt: customers.updatedAt,
        balance: sql<number>`COALESCE(${invoiceBalanceSubquery.balance}, 0) - COALESCE(${paymentTotalSubquery.total}, 0)`,
      })
      .from(customers)
      .leftJoin(invoiceBalanceSubquery, eq(customers.id, invoiceBalanceSubquery.customerId))
      .leftJoin(paymentTotalSubquery, eq(customers.id, paymentTotalSubquery.customerId))
      .where(conditions)
      .limit(limit)
      .offset(offset)
      .orderBy(orderBy)
      .all();

    const totalCount = db
      .select({ count: count() })
      .from(customers)
      .where(conditions)
      .get();

    return {
      items,
      total: totalCount?.count || 0,
    };
  }
}
