import { eq, desc, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../../database/sqlite/db';
import { customerPayments } from '../../../database/schema/customers';

export default class PaymentRepository {
  static async create(data: any) {
    const id = uuidv4();
    const newPayment = {
      ...data,
      id,
    };
    return db.insert(customerPayments).values(newPayment).returning().get();
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
