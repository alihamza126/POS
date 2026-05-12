import { db } from '../../../database/sqlite/db';
import { syncQueue } from '../../../database/schema/sync';

export interface SyncQueueEntry {
  entity: string;
  entityId: string;
  action: 'insert' | 'update' | 'delete';
  payload: any;
  deviceId: string;
  branchId: string;
}

export class SyncService {
  static async addToQueue(entry: SyncQueueEntry): Promise<void> {
    await db.insert(syncQueue).values({
      id: crypto.randomUUID(),
      entity: entry.entity,
      entityId: entry.entityId,
      action: entry.action,
      payload: JSON.stringify(entry.payload),
      deviceId: entry.deviceId,
      branchId: entry.branchId,
      status: 'pending',
      retryCount: 0,
    });
  }

  static async processQueue(): Promise<void> {
    // Placeholder for background sync logic
    // This will involve fetching 'pending' or 'failed' items and sending them to Supabase
    // eslint-disable-next-line no-console
    console.log('Sync process triggered (local-first)');
  }
}
