import { eq, and, like, or, sql, desc, count } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../../database/sqlite/db';
import { products, stockMovements } from '../../../database/schema/inventory';

export interface ProductFilter {
  query?: string;
  categoryId?: string;
  branchId: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  stockStatus?: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
  minPrice?: number;
  maxPrice?: number;
}

export class ProductRepository {
  static async create(data: any) {
    const id = uuidv4();
    const newProduct = {
      ...data,
      id,
      active: true,
    };
    return db.insert(products).values(newProduct).returning().get();
  }

  static async update(id: string, data: any) {
    // Sanitize data: remove id and other read-only fields if they exist
    const {
      id: _id,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      currentStock: _currentStock,
      ...updateData
    } = data;

    return db
      .update(products)
      .set({ ...updateData, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(products.id, id))
      .returning()
      .get();
  }

  static async softDelete(id: string) {
    return db
      .update(products)
      .set({ active: false, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(products.id, id))
      .returning()
      .get();
  }

  static async findById(id: string) {
    const product = db.select().from(products).where(eq(products.id, id)).get();
    if (!product) return null;

    const stock = await this.getCurrentStock(id);
    return { ...product, currentStock: stock };
  }

  static async findAll(filters: ProductFilter) {
    const {
      query,
      categoryId,
      branchId,
      limit = 20,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      stockStatus = 'all',
      minPrice,
      maxPrice,
    } = filters;

    let conditions = and(
      eq(products.branchId, branchId),
      eq(products.active, true),
    );

    if (query) {
      conditions = and(
        conditions,
        or(
          like(products.name, `%${query}%`),
          like(products.sku, `%${query}%`),
          like(products.barcode, `%${query}%`),
        ),
      );
    }

    if (categoryId) {
      conditions = and(conditions, eq(products.categoryId, categoryId));
    }

    if (minPrice) {
      conditions = and(
        conditions,
        sql`${products.sellingPrice} >= ${minPrice}`,
      );
    }

    if (maxPrice) {
      conditions = and(
        conditions,
        sql`${products.sellingPrice} <= ${maxPrice}`,
      );
    }

    // Handle dynamic sorting
    let orderBy: any = desc(products.createdAt);
    if (sortBy && (products as any)[sortBy]) {
      orderBy =
        sortOrder === 'desc'
          ? desc((products as any)[sortBy])
          : (products as any)[sortBy];
    }

    const items = db
      .select()
      .from(products)
      .where(conditions)
      .limit(limit)
      .offset(offset)
      .orderBy(orderBy)
      .all();

    const total = db
      .select({ count: count() })
      .from(products)
      .where(conditions)
      .get();

    // Map items to include current stock
    let itemsWithStock = await Promise.all(
      items.map(async (item) => ({
        ...item,
        currentStock: await this.getCurrentStock(item.id),
      })),
    );

    // Apply stock status filter (since stock is calculated, we filter in memory for now)
    // In a large dataset, we would join with the calculated stock in SQL
    if (stockStatus && stockStatus !== 'all') {
      itemsWithStock = itemsWithStock.filter((item) => {
        if (stockStatus === 'out_of_stock') return item.currentStock <= 0;
        if (stockStatus === 'low_stock')
          return (
            item.currentStock > 0 && item.currentStock <= item.reorderLevel
          );
        if (stockStatus === 'in_stock')
          return item.currentStock > item.reorderLevel;
        return true;
      });
    }

    return {
      items: itemsWithStock,
      total: total?.count || 0,
    };
  }

  static async getCurrentStock(productId: string) {
    const result = db
      .select({
        totalStock: sql<number>`SUM(${stockMovements.quantity})`,
      })
      .from(stockMovements)
      .where(eq(stockMovements.productId, productId))
      .get();

    return result?.totalStock || 0;
  }

  static async addStockMovement(movement: {
    productId: string;
    type: 'purchase' | 'sale' | 'return' | 'adjustment' | 'damage' | 'transfer';
    quantity: number;
    userId: string;
    branchId: string;
    reason?: string;
    referenceId?: string;
  }) {
    const id = uuidv4();
    return db
      .insert(stockMovements)
      .values({ ...movement, id })
      .returning()
      .get();
  }
}
