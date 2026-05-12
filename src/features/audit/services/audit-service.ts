import { db } from '../../../database/sqlite/db';
import { auditLogs } from '../../../database/schema/audit';
import { AuditRepository, AuditFilters } from '../repositories/audit-repository';

export interface AuditLogEntry {
  userId: string;
  deviceId: string;
  branchId: string;
  action: string;
  entity: string;
  entityId?: string;
  oldValue?: any;
  newValue?: any;
  metadata?: any;
}

export class AuditService {
  static async log(entry: AuditLogEntry): Promise<void> {
    try {
      await db.insert(auditLogs).values({
        id: crypto.randomUUID(),
        userId: entry.userId,
        deviceId: entry.deviceId,
        branchId: entry.branchId,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId,
        oldValue: entry.oldValue ? JSON.stringify(entry.oldValue) : null,
        newValue: entry.newValue ? JSON.stringify(entry.newValue) : null,
        metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
        createdAt: new Date(),
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to create audit log:', error);
    }
  }

  static async getLogs(filters: AuditFilters) {
    return AuditRepository.getLogs(filters);
  }

  static async getActions() {
    return AuditRepository.getActions();
  }
}
