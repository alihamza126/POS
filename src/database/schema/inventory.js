"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stockMovements = exports.products = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
const drizzle_orm_1 = require("drizzle-orm");
exports.products = (0, sqlite_core_1.sqliteTable)('products', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    sku: (0, sqlite_core_1.text)('sku').notNull().unique(),
    barcode: (0, sqlite_core_1.text)('barcode').unique(),
    name: (0, sqlite_core_1.text)('name').notNull(),
    description: (0, sqlite_core_1.text)('description'),
    categoryId: (0, sqlite_core_1.text)('category_id'),
    unit: (0, sqlite_core_1.text)('unit').notNull().default('pcs'),
    purchasePrice: (0, sqlite_core_1.real)('purchase_price').notNull().default(0),
    sellingPrice: (0, sqlite_core_1.real)('selling_price').notNull().default(0),
    reorderLevel: (0, sqlite_core_1.integer)('reorder_level').notNull().default(10),
    active: (0, sqlite_core_1.integer)('active', { mode: 'boolean' }).notNull().default(true),
    branchId: (0, sqlite_core_1.text)('branch_id').notNull(),
    createdAt: (0, sqlite_core_1.text)('created_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    updatedAt: (0, sqlite_core_1.text)('updated_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
exports.stockMovements = (0, sqlite_core_1.sqliteTable)('stock_movements', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    productId: (0, sqlite_core_1.text)('product_id')
        .notNull()
        .references(() => exports.products.id),
    type: (0, sqlite_core_1.text)('type', {
        enum: ['purchase', 'sale', 'return', 'adjustment', 'damage', 'transfer'],
    }).notNull(),
    quantity: (0, sqlite_core_1.integer)('quantity').notNull(), // Positive for in, negative for out
    referenceId: (0, sqlite_core_1.text)('reference_id'), // Link to invoice_id, purchase_id, etc.
    reason: (0, sqlite_core_1.text)('reason'),
    userId: (0, sqlite_core_1.text)('user_id').notNull(),
    branchId: (0, sqlite_core_1.text)('branch_id').notNull(),
    createdAt: (0, sqlite_core_1.text)('created_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
