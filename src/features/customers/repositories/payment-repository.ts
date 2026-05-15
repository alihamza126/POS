import { eq, desc, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../../database/sqlite/db';
import { customerPayments } from '../../../database/schema/customers';
import { syncService } from '../../../sync/services/sync-service';

export class PaymentRepository {
  static async create(data: any) {
    if (!data.customerId) {
      throw new Error('Customer ID is required to record a payment');
    }

    const id = uuidv4();
    const newPayment = {
      ...data,
      id,
    };
    const result = await db.insert(customerPayments).values(newPayment).returning().get();
    
    // Add to sync queue
    syncService.addToQueue('customer_payments', id, 'create', result).catch(console.error);
    
    return result;
  }

  static async findAllByCustomerId(customerId: string) {
    return db
      .select()
      .from(customerPayments)
      .where(eq(customerPayments.customerId, customerId))
      .orderBy(desc(customerPayments.createdAt))
      .all();
  }

  static async findById(id: string) {
    return db
      .select()
      .from(customerPayments)
      .where(eq(customerPayments.id, id))
      .get();
  }

  static async getTotalPayments(customerId: string) {
    const result = db
      .select({
        total: sql<number>`SUM(${customerPayments.amount})`,
      })
      .from(customerPayments)
      .where(eq(customerPayments.customerId, customerId))
      .get();

    return result?.total || 0;
  }
}
