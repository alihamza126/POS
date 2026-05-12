import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  deviceId: text('device_id'),
  branchId: text('branch_id'),
  action: text('action').notNull(),
  entity: text('entity'),
  entityId: text('entity_id'),
  oldValue: text('old_value'),
  newValue: text('new_value'),
  metadata: text('metadata'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export default auditLogs;
