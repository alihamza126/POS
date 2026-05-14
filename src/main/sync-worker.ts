import { syncService } from '../sync/services/sync-service';

export class SyncWorker {
  private interval: NodeJS.Timeout | null = null;
  private intervalMs = 60000; // 1 minute default
  private isAutoSyncEnabled = true;

  start() {
    if (this.interval) return;
    
    // Run initial sync
    this.runSync();
    
    this.interval = setInterval(() => {
      if (this.isAutoSyncEnabled) {
        this.runSync();
      }
    }, this.intervalMs);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  setAutoSync(enabled: boolean) {
    this.isAutoSyncEnabled = enabled;
  }

  setInterval(ms: number) {
    this.intervalMs = ms;
    if (this.interval) {
      this.stop();
      this.start();
    }
  }

  private async runSync() {
    try {
      await syncService.processQueue();
    } catch (error) {
      console.error('Auto-sync failed:', error);
    }
  }
}

export const syncWorker = new SyncWorker();
