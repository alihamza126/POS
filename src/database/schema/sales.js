"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceItems = exports.invoices = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
const drizzle_orm_1 = require("drizzle-orm");
exports.invoices = (0, sqlite_core_1.sqliteTable)('invoices', {
    id: (0, sqlite_core_1.text)('id').primaryKey(), // BR01-DEV01-000001
    invoiceNumber: (0, sqlite_core_1.text)('invoice_number').notNull().unique(),
    customerId: (0, sqlite_core_1.text)('customer_id'),
    totalAmount: (0, sqlite_core_1.real)('total_amount').notNull(),
    discountAmount: (0, sqlite_core_1.real)('discount_amount').notNull().default(0),
    taxAmount: (0, sqlite_core_1.real)('tax_amount').notNull().default(0),
    payableAmount: (0, sqlite_core_1.real)('payable_amount').notNull(),
    paidAmount: (0, sqlite_core_1.real)('paid_amount').notNull().default(0),
    changeAmount: (0, sqlite_core_1.real)('change_amount').notNull().default(0),
    paymentStatus: (0, sqlite_core_1.text)('payment_status', { enum: ['unpaid', 'partial', 'paid'] })
        .notNull()
        .default('unpaid'),
    paymentType: (0, sqlite_core_1.text)('payment_type', {
        enum: ['cash', 'card', 'transfer', 'credit'],
    })
        .notNull()
        .default('cash'),
    status: (0, sqlite_core_1.text)('status', { enum: ['active', 'cancelled', 'returned'] })
        .notNull()
        .default('active'),
    userId: (0, sqlite_core_1.text)('user_id').notNull(),
    branchId: (0, sqlite_core_1.text)('branch_id').notNull(),
    deviceId: (0, sqlite_core_1.text)('device_id').notNull(),
    createdAt: (0, sqlite_core_1.text)('created_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    updatedAt: (0, sqlite_core_1.text)('updated_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
exports.invoiceItems = (0, sqlite_core_1.sqliteTable)('invoice_items', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    invoiceId: (0, sqlite_core_1.text)('invoice_id')
        .notNull()
        .references(() => exports.invoices.id),
    productId: (0, sqlite_core_1.text)('product_id').notNull(),
    quantity: (0, sqlite_core_1.integer)('quantity').notNull(),
    unitPrice: (0, sqlite_core_1.real)('unit_price').notNull(),
    totalPrice: (0, sqlite_core_1.real)('total_price').notNull(),
    discount: (0, sqlite_core_1.real)('discount').notNull().default(0),
});
