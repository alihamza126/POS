import { eq, and, sql, isNull } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../../database/sqlite/db';
import { categories } from '../../../database/schema/categories';

export class CategoryRepository {
  static async create(data: {
    name: string;
    description?: string;
    branchId: string;
  }) {
    const id = uuidv4();
    return db
      .insert(categories)
      .values({ ...data, id })
      .returning()
      .get();
  }

  static async update(
    id: string,
    data: { name?: string; description?: string },
  ) {
    return db
      .update(categories)
      .set({ ...data, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(categories.id, id))
      .returning()
      .get();
  }

  static async softDelete(id: string) {
    return db
      .update(categories)
      .set({
        deletedAt: sql`CURRENT_TIMESTAMP`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(categories.id, id))
      .returning()
      .get();
  }

  static async findById(id: string) {
    return db.select().from(categories).where(eq(categories.id, id)).get();
  }

  static async findAll(branchId: string) {
    return db
      .select()
      .from(categories)
      .where(
        and(eq(categories.branchId, branchId), isNull(categories.deletedAt)),
      )
      .orderBy(categories.name)
      .all();
  }
}

export default CategoryRepository;
