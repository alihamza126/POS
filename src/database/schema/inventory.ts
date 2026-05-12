import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  sku: text('sku').notNull().unique(),
  barcode: text('barcode').unique(),
  name: text('name').notNull(),
  description: text('description'),
  categoryId: text('category_id'),
  unit: text('unit').notNull().default('pcs'),
  purchasePrice: real('purchase_price').notNull().default(0),
  sellingPrice: real('selling_price').notNull().default(0),
  reorderLevel: integer('reorder_level').notNull().default(10),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const stockMovements = sqliteTable('stock_movements', {
  id: text('id').primaryKey(),
  productId: text('product_id')
    .notNull()
    .references(() => products.id),
  type: text('type', {
    enum: ['purchase', 'sale', 'return', 'adjustment', 'damage', 'transfer'],
  }).notNull(),
  quantity: integer('quantity').notNull(), // Positive for in, negative for out
  referenceId: text('reference_id'), // Link to invoice_id, purchase_id, etc.
  reason: text('reason'),
  userId: text('user_id').notNull(),
  branchId: text('branch_id').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});
