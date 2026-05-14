import { db } from '../../database/sqlite/db';
import { syncQueue, syncLogs } from '../../database/schema/sync';
import { eq, and, asc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../shared/utils/supabase';

export interface SyncStatus {
  pendingCount: number;
  syncedCount: number;
  failedCount: number;
  lastSyncAt: Date | null;
  isSyncing: boolean;
}

export class SyncService {
  private isSyncing = false;

  async getSyncStatus(): Promise<SyncStatus> {
    const queue = await db.select().from(syncQueue);
    const logs = await db.select().from(syncLogs).orderBy(asc(syncLogs.startTime)).limit(1);

    return {
      pendingCount: queue.filter(q => q.status === 'pending').length,
      syncedCount: queue.filter(q => q.status === 'synced').length,
      failedCount: queue.filter(q => q.status === 'failed').length,
      lastSyncAt: logs[0]?.endTime || null,
      isSyncing: this.isSyncing,
    };
  }

  async getSyncHistory() {
    return db.select().from(syncLogs).orderBy(asc(syncLogs.startTime));
  }

  async processQueue() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    const logId = uuidv4();
    const startTime = new Date();
    
    await db.insert(syncLogs).values({
      id: logId,
      startTime,
      status: 'processing',
      totalItems: 0,
      syncedItems: 0,
      failedItems: 0,
    });

    try {
      const pendingItems = await db
        .select()
        .from(syncQueue)
        .where(eq(syncQueue.status, 'pending'))
        .orderBy(asc(syncQueue.createdAt));

      if (pendingItems.length === 0) {
        await db.update(syncLogs).set({
          status: 'success',
          endTime: new Date(),
          message: 'Nothing to sync',
        }).where(eq(syncLogs.id, logId));
        return;
      }

      await db.update(syncLogs).set({
        totalItems: pendingItems.length,
      }).where(eq(syncLogs.id, logId));

      let syncedCount = 0;
      let failedCount = 0;

      for (const item of pendingItems) {
        try {
          const payload = JSON.parse(item.payload);
          const { error } = await supabase
            .from(item.entity)
            .upsert({ ...payload, id: item.entityId });

          if (error) throw error;

          await db.update(syncQueue).set({
            status: 'synced',
            updatedAt: new Date(),
          }).where(eq(syncQueue.id, item.id));
          
          syncedCount++;
        } catch (error: any) {
          failedCount++;
          await db.update(syncQueue).set({
            status: 'failed',
            syncMessage: error.message,
            retryCount: item.retryCount + 1,
            updatedAt: new Date(),
            lastAttemptAt: new Date(),
          }).where(eq(syncQueue.id, item.id));
        }

        // Update log progress
        await db.update(syncLogs).set({
          syncedItems: syncedCount,
          failedItems: failedCount,
        }).where(eq(syncLogs.id, logId));
      }

      await db.update(syncLogs).set({
        status: failedCount === 0 ? 'success' : (syncedCount > 0 ? 'partial' : 'failed'),
        endTime: new Date(),
        message: `Sync completed: ${syncedCount} success, ${failedCount} failed`,
      }).where(eq(syncLogs.id, logId));

    } catch (error: any) {
      await db.update(syncLogs).set({
        status: 'failed',
        endTime: new Date(),
        message: `System Error: ${error.message}`,
      }).where(eq(syncLogs.id, logId));
    } finally {
      this.isSyncing = false;
    }
  }

  async addToQueue(entity: string, entityId: string, action: string, payload: any) {
    await db.insert(syncQueue).values({
      id: uuidv4(),
      entity,
      entityId,
      action,
      payload: JSON.stringify(payload),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

export const syncService = new SyncService();
