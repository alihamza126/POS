import { db } from '../../../database/sqlite/db';
import { auditLogs } from '../../../database/schema/audit';
import { desc, eq, and, gte, lte, like, sql } from 'drizzle-orm';

export interface AuditFilters {
  action?: string;
  entity?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export class AuditRepository {
  static async getLogs(filters: AuditFilters = {}) {
    const {
      action,
      entity,
      userId,
      startDate,
      endDate,
      limit = 50,
      offset = 0,
    } = filters;

    const conditions = [];

    if (action && action !== 'all') {
      conditions.push(eq(auditLogs.action, action));
    }

    if (entity && entity !== 'all') {
      conditions.push(eq(auditLogs.entity, entity));
    }

    if (userId) {
      conditions.push(eq(auditLogs.userId, userId));
    }

    if (startDate) {
      conditions.push(gte(auditLogs.createdAt, startDate));
    }

    if (endDate) {
      conditions.push(lte(auditLogs.createdAt, endDate));
    }

    const query = db
      .select()
      .from(auditLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset);

    const totalQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(auditLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const [logs, [totalResult]] = await Promise.all([
      query.execute(),
      totalQuery.execute(),
    ]);

    return {
      logs,
      total: totalResult.count,
    };
  }

  static async getActions() {
    const result = await db
      .selectDistinct({ action: auditLogs.action })
      .from(auditLogs)
      .execute();
    return result.map((r) => r.action);
  }
}
