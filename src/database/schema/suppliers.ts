import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { products } from './inventory';

export const suppliers = sqliteTable('suppliers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  address: text('address'),
  companyName: text('company_name'),
  contactPerson: text('contact_person'),
  notes: text('notes'),
  ntn: text('ntn'),
  branchId: text('branch_id').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
  deletedAt: text('deleted_at'),
});

export const purchaseInvoices = sqliteTable('purchase_invoices', {
  id: text('id').primaryKey(),
  invoiceNumber: text('invoice_number').notNull(), // Supplier's invoice number (e.g., 112, 218, 264)
  supplierId: text('supplier_id')
    .notNull()
    .references(() => suppliers.id),
  totalAmount: real('total_amount').notNull(),
  discountAmount: real('discount_amount').notNull().default(0),
  taxAmount: real('tax_amount').notNull().default(0),
  payableAmount: real('payable_amount').notNull(),
  paidAmount: real('paid_amount').notNull().default(0),
  paymentStatus: text('payment_status', {
    enum: ['unpaid', 'partial', 'paid'],
  })
    .notNull()
    .default('unpaid'),
  paymentType: text('payment_type', {
    enum: ['cash', 'card', 'bank_transfer', 'credit', 'cheque'],
  })
    .notNull()
    .default('credit'),
  status: text('status', { enum: ['active', 'cancelled', 'returned'] })
    .notNull()
    .default('active'),
  memo: text('memo'), // Additional notes about the purchase
  userId: text('user_id').notNull(),
  branchId: text('branch_id').notNull(),
  deviceId: text('device_id').notNull(),
  purchaseDate: text('purchase_date').default(sql`CURRENT_TIMESTAMP`), // When the purchase actually happened
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const purchaseInvoiceItems = sqliteTable('purchase_invoice_items', {
  id: text('id').primaryKey(),
  purchaseInvoiceId: text('purchase_invoice_id')
    .notNull()
    .references(() => purchaseInvoices.id),
  productId: text('product_id').references(() => products.id),
  productName: text('product_name').notNull(), // Store name for reference even if product is deleted
  quantity: integer('quantity').notNull(),
  unitPrice: real('unit_price').notNull(),
  totalPrice: real('total_price').notNull(),
  discount: real('discount').notNull().default(0),
});

export const supplierPayments = sqliteTable('supplier_payments', {
  id: text('id').primaryKey(),
  supplierId: text('supplier_id')
    .notNull()
    .references(() => suppliers.id),
  amount: real('amount').notNull(),
  paymentMethod: text('payment_method', {
    enum: ['cash', 'card', 'bank_transfer', 'cheque', 'other'],
  }).notNull(),
  bankName: text('bank_name'),
  referenceNo: text('reference_no'),
  note: text('note'),
  branchId: text('branch_id').notNull(),
  paymentDate: text('payment_date').default(sql`CURRENT_TIMESTAMP`), // When the payment was actually made
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});
