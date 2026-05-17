"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerPayments = exports.customers = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
const drizzle_orm_1 = require("drizzle-orm");
exports.customers = (0, sqlite_core_1.sqliteTable)('customers', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    name: (0, sqlite_core_1.text)('name').notNull(),
    phone: (0, sqlite_core_1.text)('phone').notNull(),
    email: (0, sqlite_core_1.text)('email'),
    address: (0, sqlite_core_1.text)('address'),
    companyName: (0, sqlite_core_1.text)('company_name'),
    notes: (0, sqlite_core_1.text)('notes'),
    ntn: (0, sqlite_core_1.text)('ntn'),
    branchId: (0, sqlite_core_1.text)('branch_id').notNull(),
    createdAt: (0, sqlite_core_1.text)('created_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    updatedAt: (0, sqlite_core_1.text)('updated_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    deletedAt: (0, sqlite_core_1.text)('deleted_at'),
});
exports.customerPayments = (0, sqlite_core_1.sqliteTable)('customer_payments', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    customerId: (0, sqlite_core_1.text)('customer_id')
        .notNull()
        .references(() => exports.customers.id),
    amount: (0, sqlite_core_1.real)('amount').notNull(),
    paymentMethod: (0, sqlite_core_1.text)('payment_method', {
        enum: ['cash', 'card', 'bank_transfer', 'cheque', 'other'],
    }).notNull(),
    bankName: (0, sqlite_core_1.text)('bank_name'),
    referenceNo: (0, sqlite_core_1.text)('reference_no'),
    note: (0, sqlite_core_1.text)('note'),
    branchId: (0, sqlite_core_1.text)('branch_id').notNull(),
    createdAt: (0, sqlite_core_1.text)('created_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    updatedAt: (0, sqlite_core_1.text)('updated_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
