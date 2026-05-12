import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../../stores/auth-store';

export function useProducts(initialFilters = {}) {
  const [products, setProducts] = useState<any[]>([]);
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

  const fetchProducts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // @ts-ignore
      const result = await window.api.products.list({
        ...filters,
        branchId: 'main-branch', // Default for now
      });
      setProducts(result.items);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, user]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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
    products,
    total,
    loading,
    filters,
    updateFilters,
    setPage,
    refresh: fetchProducts,
  };
}
