"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roles = exports.users = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
const drizzle_orm_1 = require("drizzle-orm");
exports.users = (0, sqlite_core_1.sqliteTable)('users', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    username: (0, sqlite_core_1.text)('username').notNull().unique(),
    passwordHash: (0, sqlite_core_1.text)('password_hash').notNull(),
    role: (0, sqlite_core_1.text)('role', {
        enum: ['owner', 'admin', 'manager', 'cashier', 'accountant'],
    })
        .notNull()
        .default('cashier'),
    active: (0, sqlite_core_1.integer)('active', { mode: 'boolean' }).notNull().default(true),
    createdAt: (0, sqlite_core_1.text)('created_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    updatedAt: (0, sqlite_core_1.text)('updated_at').default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
exports.roles = (0, sqlite_core_1.sqliteTable)('roles', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    name: (0, sqlite_core_1.text)('name').notNull().unique(),
    permissions: (0, sqlite_core_1.text)('permissions').notNull(), // JSON string of permission keys
});
