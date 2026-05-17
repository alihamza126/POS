"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncLogs = exports.syncQueue = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
exports.syncQueue = (0, sqlite_core_1.sqliteTable)('sync_queue', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    entity: (0, sqlite_core_1.text)('entity').notNull(),
    entityId: (0, sqlite_core_1.text)('entity_id').notNull(),
    action: (0, sqlite_core_1.text)('action').notNull(),
    payload: (0, sqlite_core_1.text)('payload').notNull(),
    status: (0, sqlite_core_1.text)('status').notNull().default('pending'), // pending, processing, synced, failed
    retryCount: (0, sqlite_core_1.integer)('retry_count').notNull().default(0),
    syncMessage: (0, sqlite_core_1.text)('sync_message'),
    deviceId: (0, sqlite_core_1.text)('device_id'),
    branchId: (0, sqlite_core_1.text)('branch_id'),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).notNull(),
    lastAttemptAt: (0, sqlite_core_1.integer)('last_attempt_at', { mode: 'timestamp' }),
});
exports.syncLogs = (0, sqlite_core_1.sqliteTable)('sync_logs', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    startTime: (0, sqlite_core_1.integer)('start_time', { mode: 'timestamp' }).notNull(),
    endTime: (0, sqlite_core_1.integer)('end_time', { mode: 'timestamp' }),
    status: (0, sqlite_core_1.text)('status').notNull(), // success, partial, failed
    totalItems: (0, sqlite_core_1.integer)('total_items').notNull().default(0),
    syncedItems: (0, sqlite_core_1.integer)('synced_items').notNull().default(0),
    failedItems: (0, sqlite_core_1.integer)('failed_items').notNull().default(0),
    message: (0, sqlite_core_1.text)('message'),
});
