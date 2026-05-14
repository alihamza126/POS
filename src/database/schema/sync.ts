import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const syncQueue = sqliteTable('sync_queue', {
  id: text('id').primaryKey(),
  entity: text('entity').notNull(),
  entityId: text('entity_id').notNull(),
  action: text('action').notNull(),
  payload: text('payload').notNull(),
  status: text('status').notNull().default('pending'), // pending, processing, synced, failed
  retryCount: integer('retry_count').notNull().default(0),
  syncMessage: text('sync_message'),
  deviceId: text('device_id'),
  branchId: text('branch_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  lastAttemptAt: integer('last_attempt_at', { mode: 'timestamp' }),
});

export const syncLogs = sqliteTable('sync_logs', {
  id: text('id').primaryKey(),
  startTime: integer('start_time', { mode: 'timestamp' }).notNull(),
  endTime: integer('end_time', { mode: 'timestamp' }),
  status: text('status').notNull(), // success, partial, failed
  totalItems: integer('total_items').notNull().default(0),
  syncedItems: integer('synced_items').notNull().default(0),
  failedItems: integer('failed_items').notNull().default(0),
  message: text('message'),
});
