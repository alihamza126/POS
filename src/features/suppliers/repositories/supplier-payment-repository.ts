import { eq, desc, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../../database/sqlite/db';
import { supplierPayments } from '../../../database/schema/suppliers';
import { syncService } from '../../../sync/services/sync-service';

export class SupplierPaymentRepository {
  static async create(data: any) {
    if (!data.supplierId) {
      throw new Error('Supplier ID is required to record a payment');
    }

    const id = uuidv4();
    const newPayment = {
      ...data,
      id,
    };
    const result = await db.insert(supplierPayments).values(newPayment).returning().get();

    // Add to sync queue
    syncService.addToQueue('supplier_payments', id, 'create', result).catch(console.error);

    return result;
  }

  static async findAllBySupplierId(supplierId: string) {
    return db
      .select()
      .from(supplierPayments)
      .where(eq(supplierPayments.supplierId, supplierId))
      .orderBy(desc(supplierPayments.createdAt))
      .all();
  }

  static async findById(id: string) {
    return db
      .select()
      .from(supplierPayments)
      .where(eq(supplierPayments.id, id))
      .get();
  }

  static async getTotalPayments(supplierId: string) {
    const result = db
      .select({
        total: sql<number>`SUM(${supplierPayments.amount})`,
      })
      .from(supplierPayments)
      .where(eq(supplierPayments.supplierId, supplierId))
      .get();

    return result?.total || 0;
  }
}
