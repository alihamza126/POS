import { sqliteTable, text, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const customers = sqliteTable('customers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  address: text('address'),
  companyName: text('company_name'),
  notes: text('notes'),
  ntn: text('ntn'),
  branchId: text('branch_id').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
  deletedAt: text('deleted_at'),
});

export const customerPayments = sqliteTable('customer_payments', {
  id: text('id').primaryKey(),
  customerId: text('customer_id')
    .notNull()
    .references(() => customers.id),
  amount: real('amount').notNull(),
  paymentMethod: text('payment_method', {
    enum: ['cash', 'card', 'bank_transfer', 'cheque', 'other'],
  }).notNull(),
  bankName: text('bank_name'),
  referenceNo: text('reference_no'),
  note: text('note'),
  branchId: text('branch_id').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});
