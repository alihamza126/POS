import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const invoices = sqliteTable('invoices', {
  id: text('id').primaryKey(), // BR01-DEV01-000001
  invoiceNumber: text('invoice_number').notNull().unique(),
  customerId: text('customer_id'),
  totalAmount: real('total_amount').notNull(),
  discountAmount: real('discount_amount').notNull().default(0),
  taxAmount: real('tax_amount').notNull().default(0),
  payableAmount: real('payable_amount').notNull(),
  paidAmount: real('paid_amount').notNull().default(0),
  changeAmount: real('change_amount').notNull().default(0),
  paymentStatus: text('payment_status', { enum: ['unpaid', 'partial', 'paid'] })
    .notNull()
    .default('unpaid'),
  paymentType: text('payment_type', {
    enum: ['cash', 'card', 'transfer', 'credit'],
  })
    .notNull()
    .default('cash'),
  status: text('status', { enum: ['active', 'cancelled', 'returned'] })
    .notNull()
    .default('active'),
  userId: text('user_id').notNull(),
  branchId: text('branch_id').notNull(),
  deviceId: text('device_id').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const invoiceItems = sqliteTable('invoice_items', {
  id: text('id').primaryKey(),
  invoiceId: text('invoice_id')
    .notNull()
    .references(() => invoices.id),
  productId: text('product_id').notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: real('unit_price').notNull(),
  totalPrice: real('total_price').notNull(),
  discount: real('discount').notNull().default(0),
});
