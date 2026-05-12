import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const syncQueue = sqliteTable('sync_queue', {
  id: text('id').primaryKey(),
  entity: text('entity').notNull(),
  entityId: text('entity_id').notNull(),
  action: text('action').notNull(),
  payload: text('payload').notNull(),
  status: text('status').notNull().default('pending'),
  retryCount: integer('retry_count').notNull().default(0),
  deviceId: text('device_id'),
  branchId: text('branch_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  lastAttemptAt: integer('last_attempt_at', { mode: 'timestamp' }),
});

export default syncQueue;
