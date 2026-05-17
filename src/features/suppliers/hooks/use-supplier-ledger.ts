import { useState, useEffect, useCallback } from 'react';

export function useSupplierLedger(supplierId: string | undefined) {
  const [ledger, setLedger] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchLedgerData = useCallback(async () => {
    if (!supplierId) return;
    setLoading(true);
    try {
      // @ts-ignore
      const [ledgerResult, summaryResult] = await Promise.all([
        // @ts-ignore
        window.api.suppliers.getLedger(supplierId),
        // @ts-ignore
        window.api.suppliers.getSummary(supplierId),
      ]);
      setLedger(ledgerResult);
      setSummary(summaryResult);
    } catch (error) {
      console.error('Failed to fetch supplier ledger data:', error);
    } finally {
      setLoading(false);
    }
  }, [supplierId]);

  useEffect(() => {
    fetchLedgerData();
  }, [fetchLedgerData]);

  return {
    ledger,
    summary,
    loading,
    refresh: fetchLedgerData,
  };
}
