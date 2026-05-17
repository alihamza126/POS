import { db } from '../../database/sqlite/db';
import { syncQueue, syncLogs } from '../../database/schema/sync';
import { categories } from '../../database/schema/categories';
import { suppliers, purchaseInvoices, supplierPayments } from '../../database/schema/suppliers';
import { customers, customerPayments } from '../../database/schema/customers';
import { products, stockMovements } from '../../database/schema/inventory';
import { invoices, invoiceItems } from '../../database/schema/sales';
import { eq, and, asc, or, lt, sql } from 'drizzle-orm';
import crypto from 'crypto';
import { supabase } from '../../shared/utils/supabase';

export interface SyncStatus {
  pendingCount: number;
  syncedCount: number;
  failedCount: number;
  lastSyncAt: Date | null;
  isSyncing: boolean;
}

function camelToSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

function convertKeysToSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => convertKeysToSnakeCase(v));
  } else if (obj !== null && typeof obj === 'object') {
    if (obj instanceof Date) {
      return obj.toISOString();
    }
    return Object.keys(obj).reduce((result: any, key) => {
      const snakeKey = camelToSnakeCase(key);
      result[snakeKey] = convertKeysToSnakeCase(obj[key]);
      return result;
    }, {});
  }
  return obj;
}

export class SyncService {
  private isSyncing = false;

  async getSyncStatus(): Promise<SyncStatus> {
    return this.getStatus();
  }

  async getSyncHistory() {
    return db
      .select()
      .from(syncLogs)
      .orderBy(asc(syncLogs.startTime));
  }

  async getStatus(): Promise<SyncStatus> {
    const counts = await db
      .select({
        status: syncQueue.status,
      })
      .from(syncQueue);

    const status: SyncStatus = {
      pendingCount: 0,
      syncedCount: 0,
      failedCount: 0,
      lastSyncAt: null,
      isSyncing: this.isSyncing,
    };

    counts.forEach((item) => {
      if (item.status === 'pending') status.pendingCount++;
      else if (item.status === 'synced') status.syncedCount++;
      else if (item.status === 'failed') status.failedCount++;
    });

    const lastLog = await db
      .select()
      .from(syncLogs)
      .orderBy(asc(syncLogs.endTime))
      .limit(1);

    if (lastLog.length > 0) {
      status.lastSyncAt = lastLog[0].endTime;
    }

    return status;
  }

  /**
   * Identifies any local database records that are not yet tracked in the sync_queue,
   * and automatically adds them as pending sync items.
   */
  async bootstrapQueue() {
    console.log('[SyncService] Bootstrapping sync queue for missing legacy records...');
    
    const tablesToCheck = [
      { name: 'categories', schema: categories },
      { name: 'suppliers', schema: suppliers },
      { name: 'customers', schema: customers },
      { name: 'products', schema: products },
      { name: 'stock_movements', schema: stockMovements },
      { name: 'purchase_invoices', schema: purchaseInvoices },
      { name: 'sales', schema: invoices }, // the database table is 'invoices', but often referred to as sales
      { name: 'invoices', schema: invoices },
      { name: 'invoice_items', schema: invoiceItems },
      { name: 'customer_payments', schema: customerPayments },
      { name: 'supplier_payments', schema: supplierPayments },
    ];

    for (const table of tablesToCheck) {
      try {
        // Find all local records in this table
        const localRecords = await db.select().from(table.schema);
        
        // Find all entityIds in sync_queue for this entity
        const queuedIds = await db
          .select({ entityId: syncQueue.entityId })
          .from(syncQueue)
          .where(eq(syncQueue.entity, table.name));
          
        const queuedSet = new Set(queuedIds.map(q => q.entityId));
        
        let addedCount = 0;
        for (const record of localRecords) {
          if (!queuedSet.has(record.id)) {
            // Add to sync queue as pending
            await this.addToQueue(table.name, record.id, 'create', record);
            addedCount++;
          }
        }
        
        if (addedCount > 0) {
          console.log(`[SyncService] Bootstrapped ${addedCount} missing records for table '${table.name}'`);
        }
      } catch (error) {
        // Suppress or log non-critical errors (e.g. if table is empty or missing)
        console.warn(`[SyncService] Skipping bootstrap for '${table.name}':`, error instanceof Error ? error.message : error);
      }
    }
  }

  async processQueue() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    // Run the bootstrapping logic to bring legacy/offline items into the queue
    try {
      await this.bootstrapQueue();
    } catch (bootstrapErr) {
      console.error('[SyncService] Bootstrap failed:', bootstrapErr);
    }

    const logId = crypto.randomUUID();
    await db.insert(syncLogs).values({
      id: logId,
      startTime: new Date(),
      status: 'running',
    });

    try {
      // Query pending and failed items with a retry count limit, ordered by Entity dependency Priority
      const pendingItems = await db
        .select()
        .from(syncQueue)
        .where(
          or(
            eq(syncQueue.status, 'pending'),
            and(
              eq(syncQueue.status, 'failed'),
              lt(syncQueue.retryCount, 5)
            )
          )
        )
        .orderBy(
          sql`CASE ${syncQueue.entity}
            WHEN 'categories' THEN 1
            WHEN 'customers' THEN 2
            WHEN 'suppliers' THEN 2
            WHEN 'products' THEN 3
            WHEN 'invoices' THEN 4
            WHEN 'purchase_invoices' THEN 4
            WHEN 'invoice_items' THEN 5
            WHEN 'purchase_invoice_items' THEN 5
            WHEN 'stock_movements' THEN 6
            WHEN 'customer_payments' THEN 7
            WHEN 'supplier_payments' THEN 7
            ELSE 10
          END ASC`,
          asc(syncQueue.createdAt)
        );

      console.log(`[SyncService] Found ${pendingItems.length} items to sync in prioritized order`);

      if (pendingItems.length === 0) {
        await db.update(syncLogs).set({
          status: 'success',
          endTime: new Date(),
          message: 'Nothing to sync',
          totalItems: 0,
          syncedItems: 0,
          failedItems: 0,
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
          const rawPayload = JSON.parse(item.payload);
          
          if (item.entity === 'purchase_invoices' && rawPayload.items) {
            const { items, ...invoiceData } = rawPayload;
            
            const snakeInvoiceData = convertKeysToSnakeCase(invoiceData);
            const { error: invoiceError } = await supabase
              .from('purchase_invoices')
              .upsert({ ...snakeInvoiceData, id: item.entityId });
              
            if (invoiceError) throw invoiceError;
            
            if (Array.isArray(items)) {
              for (const childItem of items) {
                const snakeChildItem = convertKeysToSnakeCase(childItem);
                const { error: itemError } = await supabase
                  .from('purchase_invoice_items')
                  .upsert(snakeChildItem);
                if (itemError) throw itemError;
              }
            }
          } else {
            const snakePayload = convertKeysToSnakeCase(rawPayload);
            
            // Map common database differences safely
            // For example, if entity is 'sales', the Supabase table name is 'invoices'
            const targetTable = item.entity === 'sales' ? 'invoices' : item.entity;
            
            const { error } = await supabase
              .from(targetTable)
              .upsert({ ...snakePayload, id: item.entityId });

            if (error) throw error;
          }

          await db.update(syncQueue).set({
            status: 'synced',
            syncMessage: 'Synced successfully',
            updatedAt: new Date(),
          }).where(eq(syncQueue.id, item.id));
          
          syncedCount++;
          console.log(`[SyncService] Successfully synced entity '${item.entity}' (ID: ${item.entityId})`);
        } catch (error: any) {
          failedCount++;
          const errorMsg = error?.message || 'Unknown error occurred during sync';
          console.error(`[SyncService] Failed to sync entity '${item.entity}' (ID: ${item.entityId}):`, errorMsg);
          
          await db.update(syncQueue).set({
            status: 'failed',
            syncMessage: errorMsg,
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
      console.error('[SyncService] Critical queue processing error:', error);
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
    const branchId = payload?.branchId || payload?.branch_id || null;
    const deviceId = payload?.deviceId || payload?.device_id || null;

    // Check if there is already a pending sync item for this entity and ID to avoid duplicates
    const existing = await db
      .select()
      .from(syncQueue)
      .where(
        and(
          eq(syncQueue.entity, entity),
          eq(syncQueue.entityId, entityId),
          eq(syncQueue.status, 'pending')
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Just update the payload and skip inserting a duplicate
      await db.update(syncQueue).set({
        payload: JSON.stringify(payload),
        updatedAt: new Date(),
      }).where(eq(syncQueue.id, existing[0].id));
      return;
    }

    await db.insert(syncQueue).values({
      id: crypto.randomUUID(),
      entity,
      entityId,
      action,
      payload: JSON.stringify(payload),
      status: 'pending',
      branchId,
      deviceId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

export const syncService = new SyncService();
