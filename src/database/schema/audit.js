"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogs = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
exports.auditLogs = (0, sqlite_core_1.sqliteTable)('audit_logs', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    userId: (0, sqlite_core_1.text)('user_id'),
    deviceId: (0, sqlite_core_1.text)('device_id'),
    branchId: (0, sqlite_core_1.text)('branch_id'),
    action: (0, sqlite_core_1.text)('action').notNull(),
    entity: (0, sqlite_core_1.text)('entity'),
    entityId: (0, sqlite_core_1.text)('entity_id'),
    oldValue: (0, sqlite_core_1.text)('old_value'),
    newValue: (0, sqlite_core_1.text)('new_value'),
    metadata: (0, sqlite_core_1.text)('metadata'),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull(),
});
exports.default = exports.auditLogs;
