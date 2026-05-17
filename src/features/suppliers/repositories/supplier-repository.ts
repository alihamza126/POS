import { eq, and, like, or, sql, desc, count, isNull } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../../database/sqlite/db';
import { suppliers } from '../../../database/schema/suppliers';
import { purchaseInvoices } from '../../../database/schema/suppliers';
import { supplierPayments } from '../../../database/schema/suppliers';
import { syncService } from '../../../sync/services/sync-service';

export interface SupplierFilter {
  query?: string;
  branchId: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class SupplierRepository {
  static async create(data: any) {
    const id = uuidv4();
    const newSupplier = {
      ...data,
      id,
    };
    const result = await db
      .insert(suppliers)
      .values(newSupplier)
      .returning()
      .get();

    // Add to sync queue
    syncService
      .addToQueue('suppliers', id, 'create', result)
      .catch(console.error);

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
      .update(suppliers)
      .set({ ...updateData, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(suppliers.id, id))
      .returning()
      .get();

    // Add to sync queue
    syncService
      .addToQueue('suppliers', id, 'update', result)
      .catch(console.error);

    return result;
  }

  static async softDelete(id: string) {
    const result = await db
      .update(suppliers)
      .set({
        deletedAt: sql`CURRENT_TIMESTAMP`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(suppliers.id, id))
      .returning()
      .get();

    // Add to sync queue
    syncService
      .addToQueue('suppliers', id, 'delete', result)
      .catch(console.error);

    return result;
  }

  static async findById(id: string) {
    return db.select().from(suppliers).where(eq(suppliers.id, id)).get();
  }

  static async findAll(filters: SupplierFilter) {
    const {
      query,
      branchId,
      limit = 20,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    let conditions = and(
      eq(suppliers.branchId, branchId),
      isNull(suppliers.deletedAt),
    );

    if (query) {
      conditions = and(
        conditions,
        or(
          like(suppliers.name, `%${query}%`),
          like(suppliers.phone, `%${query}%`),
          like(suppliers.companyName, `%${query}%`),
          like(suppliers.contactPerson, `%${query}%`),
        ),
      );
    }

    let orderBy: any = desc(suppliers.createdAt);
    if (sortBy && (suppliers as any)[sortBy]) {
      orderBy =
        sortOrder === 'desc'
          ? desc((suppliers as any)[sortBy])
          : (suppliers as any)[sortBy];
    }

    // Subquery for purchase invoice balance (what we owe)
    const purchaseBalanceSubquery = db
      .select({
        supplierId: purchaseInvoices.supplierId,
        balance:
          sql<number>`SUM(${purchaseInvoices.payableAmount} - ${purchaseInvoices.paidAmount})`.as(
            'purchase_balance',
          ),
      })
      .from(purchaseInvoices)
      .where(eq(purchaseInvoices.status, 'active'))
      .groupBy(purchaseInvoices.supplierId)
      .as('pur_bal');

    // Subquery for payment total (what we've paid)
    const paymentTotalSubquery = db
      .select({
        supplierId: supplierPayments.supplierId,
        total:
          sql<number>`SUM(${supplierPayments.amount})`.as('payment_total'),
      })
      .from(supplierPayments)
      .groupBy(supplierPayments.supplierId)
      .as('pay_tot');

    // Join with suppliers to get items with balance
    const items = db
      .select({
        id: suppliers.id,
        name: suppliers.name,
        phone: suppliers.phone,
        email: suppliers.email,
        address: suppliers.address,
        companyName: suppliers.companyName,
        contactPerson: suppliers.contactPerson,
        ntn: suppliers.ntn,
        branchId: suppliers.branchId,
        createdAt: suppliers.createdAt,
        updatedAt: suppliers.updatedAt,
        balance: sql<number>`COALESCE(${purchaseBalanceSubquery.balance}, 0) - COALESCE(${paymentTotalSubquery.total}, 0)`,
      })
      .from(suppliers)
      .leftJoin(
        purchaseBalanceSubquery,
        eq(suppliers.id, purchaseBalanceSubquery.supplierId),
      )
      .leftJoin(
        paymentTotalSubquery,
        eq(suppliers.id, paymentTotalSubquery.supplierId),
      )
      .where(conditions)
      .limit(limit)
      .offset(offset)
      .orderBy(orderBy)
      .all();

    const totalCount = db
      .select({ count: count() })
      .from(suppliers)
      .where(conditions)
      .get();

    return {
      items,
      total: totalCount?.count || 0,
    };
  }
}
