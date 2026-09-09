import React, { useState, useEffect, useCallback } from 'react';
import {
  Cloud,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Database,
  History,
  Activity,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { useToast } from '../../../hooks/use-toast';
import { format } from 'date-fns';

export default function SyncSettings() {
  const { toast } = useToast();
  const [status, setStatus] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [failedItems, setFailedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [retryingAll, setRetryingAll] = useState(false);
  const [autoSync, setAutoSync] = useState(true);

  const fetchStatus = async () => {
    // @ts-ignore
    const s = await window.api.sync.getStatus();
    setStatus(s);
  };

  const fetchHistory = async () => {
    // @ts-ignore
    const h = await window.api.sync.getHistory();
    setHistory(h);
  };

  const fetchFailedItems = useCallback(async () => {
    try {
      // @ts-ignore
      const items = await window.api.sync.getFailedItems();
      setFailedItems(items || []);
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    fetchHistory();
    fetchFailedItems();
    const interval = setInterval(() => {
      fetchStatus();
      fetchFailedItems();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchFailedItems]);

  const handleManualSync = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      await window.api.sync.triggerSync();
      await fetchStatus();
      await fetchHistory();
      await fetchFailedItems();
    } finally {
      setLoading(false);
    }
  };

  const handleRetryItem = async (id: string) => {
    setRetryingId(id);
    try {
      // @ts-ignore
      await window.api.sync.retryItem(id);
      await fetchStatus();
      await fetchFailedItems();
      toast({ title: 'Retried', description: 'The item was queued again — check status above.' });
    } catch (err: any) {
      toast({
        title: 'Retry Failed',
        description: err?.message || 'Could not retry this item.',
        variant: 'destructive',
      });
    } finally {
      setRetryingId(null);
    }
  };

  const handleRetryAllFailed = async () => {
    setRetryingAll(true);
    try {
      // @ts-ignore
      await window.api.sync.retryAllFailed();
      await fetchStatus();
      await fetchFailedItems();
      toast({ title: 'Retrying All', description: 'All failed items were queued again.' });
    } catch (err: any) {
      toast({
        title: 'Retry Failed',
        description: err?.message || 'Could not retry the failed items.',
        variant: 'destructive',
      });
    } finally {
      setRetryingAll(false);
    }
  };

  const toggleAutoSync = async () => {
    const newVal = !autoSync;
    setAutoSync(newVal);
    try {
      // @ts-ignore
      await window.api.sync.setAuto(newVal);
    } catch (err: any) {
      setAutoSync(!newVal); // revert the optimistic UI change
      toast({
        title: 'Could Not Change Auto-Sync',
        description: err?.message || 'You may not have permission to change this setting.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <Cloud size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-navy">Cloud Synchronization</h2>
            <p className="text-sm text-navy/60">Keep your local POS data synced with Supabase</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={toggleAutoSync}
            className={`rounded-xl border-navy/10 ${autoSync ? 'bg-primary/5 text-primary' : 'bg-surface'}`}
          >
            {autoSync ? 'Auto-Sync ON' : 'Auto-Sync OFF'}
          </Button>
          <Button 
            onClick={handleManualSync} 
            disabled={loading || status?.isSyncing}
            className="rounded-xl shadow-lg shadow-primary/20 bg-primary text-white hover:bg-primary/90"
          >
            <RefreshCw size={18} className={`mr-2 ${status?.isSyncing ? 'animate-spin' : ''}`} />
            {status?.isSyncing ? 'Syncing...' : 'Sync Now'}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface p-5 rounded-3xl border border-navy/10 shadow-soft">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
              <Database size={18} />
            </div>
            <span className="text-sm font-bold text-navy/60">Local Queue</span>
          </div>
          <div className="text-2xl font-black text-navy">{status?.pendingCount || 0}</div>
          <p className="text-xs text-navy/40 mt-1">Pending sync</p>
        </div>

        <div className="bg-surface p-5 rounded-3xl border border-navy/10 shadow-soft">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
              <CheckCircle2 size={18} />
            </div>
            <span className="text-sm font-bold text-navy/60">Synced</span>
          </div>
          <div className="text-2xl font-black text-navy">{status?.syncedCount || 0}</div>
          <p className="text-xs text-navy/40 mt-1">Total items cloud</p>
        </div>

        <div className="bg-surface p-5 rounded-3xl border border-navy/10 shadow-soft">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500">
              <XCircle size={18} />
            </div>
            <span className="text-sm font-bold text-navy/60">Failed</span>
          </div>
          <div className="text-2xl font-black text-navy">{status?.failedCount || 0}</div>
          <p className="text-xs text-navy/40 mt-1">Action required</p>
        </div>

        <div className="bg-surface p-5 rounded-3xl border border-navy/10 shadow-soft">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
              <Clock size={18} />
            </div>
            <span className="text-sm font-bold text-navy/60">Last Sync</span>
          </div>
          <div className="text-lg font-black text-navy">
            {status?.lastSyncAt ? format(new Date(status.lastSyncAt), 'p') : 'Never'}
          </div>
          <p className="text-xs text-navy/40 mt-1">
            {status?.lastSyncAt ? format(new Date(status.lastSyncAt), 'MMM dd, yyyy') : 'No history'}
          </p>
        </div>
      </div>

      {/* Progress Section */}
      {status?.isSyncing && (
        <div className="bg-primary/5 border border-primary/20 p-6 rounded-3xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Activity className="text-primary animate-pulse" size={20} />
              <span className="font-bold text-navy">Syncing Data...</span>
            </div>
            <span className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">
              In Progress
            </span>
          </div>
          <div className="w-full bg-navy/10 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-500" 
              style={{ width: `${((status.syncedCount + status.failedCount) / (status.pendingCount + status.syncedCount + status.failedCount)) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-3 text-xs text-navy/60 font-medium">
            <span>Processing local queue...</span>
            <span>{status.syncedCount} of {status.pendingCount + status.syncedCount} completed</span>
          </div>
        </div>
      )}

      {/* Failed Items — per-record detail + retry, not just a count */}
      {failedItems.length > 0 && (
        <div className="bg-surface rounded-3xl border border-rose-200 shadow-soft overflow-hidden">
          <div className="p-6 border-b border-rose-100 flex items-center justify-between bg-rose-50/50">
            <div className="flex items-center gap-3">
              <XCircle className="text-rose-500" size={20} />
              <div>
                <h3 className="font-bold text-navy text-lg">Failed Items ({failedItems.length})</h3>
                <p className="text-xs text-navy/50">These records could not reach the cloud — see why below.</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleRetryAllFailed}
              disabled={retryingAll}
              className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50"
            >
              <RotateCcw size={16} className={`mr-2 ${retryingAll ? 'animate-spin' : ''}`} />
              Retry All
            </Button>
          </div>
          <div className="divide-y divide-navy/5">
            {failedItems.map((item) => (
              <div key={item.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-navy/40">
                      {item.entity}
                    </span>
                    <span className="text-xs text-navy/30">·</span>
                    <span className="text-xs font-bold text-navy/50">{item.action}</span>
                    <span className="text-xs text-navy/30">·</span>
                    <span className="text-xs text-navy/40">{item.retryCount} attempts</span>
                  </div>
                  <p className="text-sm text-rose-600 font-medium mt-1 truncate">
                    {item.syncMessage || 'Unknown error'}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRetryItem(item.id)}
                  disabled={retryingId === item.id}
                  className="shrink-0 rounded-xl"
                >
                  {retryingId === item.id ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    'Retry'
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sync History Table */}
      <div className="bg-surface rounded-3xl border border-navy/10 shadow-soft overflow-hidden">
        <div className="p-6 border-b border-navy/5 flex items-center justify-between bg-navy/[0.02]">
          <div className="flex items-center gap-3">
            <History className="text-navy/60" size={20} />
            <h3 className="font-bold text-navy text-lg">Sync History</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-navy/[0.01] text-xs font-black text-navy/40 uppercase tracking-widest border-b border-navy/5">
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Start Time</th>
                <th className="px-6 py-4">End Time</th>
                <th className="px-6 py-4 text-right">Items</th>
                <th className="px-6 py-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {history.length > 0 ? history.map((log) => (
                <tr key={log.id} className="text-sm hover:bg-navy/[0.01] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {log.status === 'success' && <CheckCircle2 size={16} className="text-emerald-500" />}
                      {log.status === 'failed' && <XCircle size={16} className="text-rose-500" />}
                      {log.status === 'partial' && <AlertCircle size={16} className="text-amber-500" />}
                      {log.status === 'processing' && <RefreshCw size={16} className="text-primary animate-spin" />}
                      <span className="font-bold capitalize text-navy/80">{log.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-navy/60">
                    {format(new Date(log.startTime), 'MMM dd, p')}
                  </td>
                  <td className="px-6 py-4 text-navy/60">
                    {log.endTime ? format(new Date(log.endTime), 'p') : '---'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-black text-navy">{log.syncedItems}/{log.totalItems}</span>
                      {log.failedItems > 0 && (
                        <span className="text-[10px] text-rose-500 font-bold leading-none">
                          {log.failedItems} failed
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-navy/60 line-clamp-1 group-hover:line-clamp-none transition-all">
                      {log.message || 'Standard sync process'}
                    </p>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-navy/30">
                      <History size={40} strokeWidth={1} />
                      <p className="font-bold">No sync history found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
