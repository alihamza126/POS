import { useState, useEffect, useCallback } from 'react';
import { APP_CONFIG } from '../../../shared/constants/config';

interface ExpiryAlert {
  alert: {
    id: string;
    productId: string;
    batchId: string | null;
    expiryDate: string;
    daysUntilExpiry: number;
    severity: 'critical' | 'warning' | 'info';
    status: string;
    branchId: string;
    createdAt: string | null;
  };
  productName: string | null;
  productSku: string | null;
  composition: string | null;
}

interface AlertCounts {
  critical: number;
  warning: number;
  info: number;
  total: number;
}

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export function useExpiryAlerts() {
  const [alerts, setAlerts] = useState<ExpiryAlert[]>([]);
  const [counts, setCounts] = useState<AlertCounts>({ critical: 0, warning: 0, info: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const branchId = APP_CONFIG.branch.defaultId;

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      // @ts-ignore
      const [alertsData, countsData] = await Promise.all([
        // @ts-ignore
        window.api.medical.getAlerts(branchId),
        // @ts-ignore
        window.api.medical.getAlertCounts(branchId),
      ]);
      setAlerts(alertsData ?? []);
      setCounts(countsData ?? { critical: 0, warning: 0, info: 0, total: 0 });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch expiry alerts:', err);
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  const refreshAlerts = useCallback(
    async (thresholdDays: number = 90) => {
      try {
        // @ts-ignore
        await window.api.medical.refreshAlerts(branchId, thresholdDays);
        await fetchAlerts();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to refresh alerts:', err);
      }
    },
    [branchId, fetchAlerts],
  );

  const dismissAlert = useCallback(
    async (alertId: string, userId: string) => {
      try {
        // @ts-ignore
        await window.api.medical.dismissAlert(alertId, userId, branchId);
        setAlerts((prev) => prev.filter((a) => a.alert.id !== alertId));
        setCounts((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to dismiss alert:', err);
      }
    },
    [branchId],
  );

  // Initial fetch + periodic refresh
  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  return {
    alerts,
    counts,
    loading,
    fetchAlerts,
    refreshAlerts,
    dismissAlert,
  };
}
