"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supplierPayments = exports.purchaseInvoiceItems = exports.purchaseInvoices = exports.suppliers = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
const drizzle_orm_1 = require("drizzle-orm");
const inventory_1 = require("./inventory");
exports.suppliers = (0, sqlite_core_1.sqliteTable)('suppliers', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    name: (0, sqlite_core_1.text)('name').notNull(),
    phone: (0, sqlite_core_1.text)('phone').notNull(),
    email: (0, sqlite_core_1.text)('email'),
    address: (0, sqlite_core_1.text)('address'),
    companyName: (0, sqlite_core_1.text)('company_name'),
    contactPerson: (0, sqlite_core_1.text)('contact_person'),
    notes: (0, sqlite_core_1.text)('notes'),
    ntn: (0, sqlite_core_1.text)('ntn'),
    branchId: (0, sqlite_core_1.text)('branch_id').notNull(),
    createdAt: (0, sqlite_core_1.text)('created_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    updatedAt: (0, sqlite_core_1.text)('updated_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    deletedAt: (0, sqlite_core_1.text)('deleted_at'),
});
exports.purchaseInvoices = (0, sqlite_core_1.sqliteTable)('purchase_invoices', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    invoiceNumber: (0, sqlite_core_1.text)('invoice_number').notNull(), // Supplier's invoice number (e.g., 112, 218, 264)
    supplierId: (0, sqlite_core_1.text)('supplier_id')
        .notNull()
        .references(() => exports.suppliers.id),
    totalAmount: (0, sqlite_core_1.real)('total_amount').notNull(),
    discountAmount: (0, sqlite_core_1.real)('discount_amount').notNull().default(0),
    taxAmount: (0, sqlite_core_1.real)('tax_amount').notNull().default(0),
    payableAmount: (0, sqlite_core_1.real)('payable_amount').notNull(),
    paidAmount: (0, sqlite_core_1.real)('paid_amount').notNull().default(0),
    paymentStatus: (0, sqlite_core_1.text)('payment_status', {
        enum: ['unpaid', 'partial', 'paid'],
    })
        .notNull()
        .default('unpaid'),
    paymentType: (0, sqlite_core_1.text)('payment_type', {
        enum: ['cash', 'card', 'bank_transfer', 'credit', 'cheque'],
    })
        .notNull()
        .default('credit'),
    status: (0, sqlite_core_1.text)('status', { enum: ['active', 'cancelled', 'returned'] })
        .notNull()
        .default('active'),
    memo: (0, sqlite_core_1.text)('memo'), // Additional notes about the purchase
    userId: (0, sqlite_core_1.text)('user_id').notNull(),
    branchId: (0, sqlite_core_1.text)('branch_id').notNull(),
    deviceId: (0, sqlite_core_1.text)('device_id').notNull(),
    purchaseDate: (0, sqlite_core_1.text)('purchase_date').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`), // When the purchase actually happened
    createdAt: (0, sqlite_core_1.text)('created_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    updatedAt: (0, sqlite_core_1.text)('updated_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
exports.purchaseInvoiceItems = (0, sqlite_core_1.sqliteTable)('purchase_invoice_items', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    purchaseInvoiceId: (0, sqlite_core_1.text)('purchase_invoice_id')
        .notNull()
        .references(() => exports.purchaseInvoices.id),
    productId: (0, sqlite_core_1.text)('product_id').references(() => inventory_1.products.id),
    productName: (0, sqlite_core_1.text)('product_name').notNull(), // Store name for reference even if product is deleted
    quantity: (0, sqlite_core_1.integer)('quantity').notNull(),
    unitPrice: (0, sqlite_core_1.real)('unit_price').notNull(),
    totalPrice: (0, sqlite_core_1.real)('total_price').notNull(),
    discount: (0, sqlite_core_1.real)('discount').notNull().default(0),
});
exports.supplierPayments = (0, sqlite_core_1.sqliteTable)('supplier_payments', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    supplierId: (0, sqlite_core_1.text)('supplier_id')
        .notNull()
        .references(() => exports.suppliers.id),
    amount: (0, sqlite_core_1.real)('amount').notNull(),
    paymentMethod: (0, sqlite_core_1.text)('payment_method', {
        enum: ['cash', 'card', 'bank_transfer', 'cheque', 'other'],
    }).notNull(),
    bankName: (0, sqlite_core_1.text)('bank_name'),
    referenceNo: (0, sqlite_core_1.text)('reference_no'),
    note: (0, sqlite_core_1.text)('note'),
    branchId: (0, sqlite_core_1.text)('branch_id').notNull(),
    paymentDate: (0, sqlite_core_1.text)('payment_date').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`), // When the payment was actually made
    createdAt: (0, sqlite_core_1.text)('created_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    updatedAt: (0, sqlite_core_1.text)('updated_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
