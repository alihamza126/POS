import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../../stores/auth-store';

export function useCustomers(initialFilters = {}) {
  const [customers, setCustomers] = useState<any[]>([]);
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

  const fetchCustomers = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // @ts-ignore
      const result = await window.api.customers.list({
        ...filters,
        branchId: 'main-branch',
      });
      setCustomers(result.items);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, user]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

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
    customers,
    total,
    loading,
    filters,
    updateFilters,
    setPage,
    refresh: fetchCustomers,
  };
}
