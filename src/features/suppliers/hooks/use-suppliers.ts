import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../../stores/auth-store';
import { APP_CONFIG } from '../../../shared/constants/config';

export function useSuppliers(initialFilters = {}) {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>({
    query: '',
    limit: 20,
    offset: 0,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...initialFilters,
  });

  const { user } = useAuthStore();

  const fetchSuppliers = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // @ts-ignore
      const result = await window.api.suppliers.list({
        ...filters,
        branchId: APP_CONFIG.branch.defaultId,
      });
      setSuppliers(result.items);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, user]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const updateFilters = (newFilters: any) => {
    setFilters((prev: any) => ({ ...prev, ...newFilters, offset: 0 }));
  };

  const setPage = (page: number) => {
    setFilters((prev: any) => ({
      ...prev,
      offset: (page - 1) * prev.limit,
    }));
  };

  return {
    suppliers,
    total,
    loading,
    filters,
    updateFilters,
    setPage,
    refresh: fetchSuppliers,
  };
}
