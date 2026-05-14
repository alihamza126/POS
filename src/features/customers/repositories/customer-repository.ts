import { eq, and, like, or, sql, desc, count, isNull } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../../database/sqlite/db';
import { customers } from '../../../database/schema/customers';

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
    return db.insert(customers).values(newCustomer).returning().get();
  }

  static async update(id: string, data: any) {
    const {
      id: _id,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      ...updateData
    } = data;
    // eslint-disable-next-line no-console
    console.log('Excluding fields from update:', {
      _id,
      _createdAt,
      _updatedAt,
    });

    return db
      .update(customers)
      .set({ ...updateData, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(customers.id, id))
      .returning()
      .get();
  }

  static async softDelete(id: string) {
    return db
      .update(customers)
      .set({
        deletedAt: sql`CURRENT_TIMESTAMP`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(customers.id, id))
      .returning()
      .get();
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

    const items = db
      .select()
      .from(customers)
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
