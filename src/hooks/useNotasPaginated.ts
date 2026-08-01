import { useState, useEffect, useCallback, useRef } from 'react';
import type { PaginatedResponse } from '../types';

interface UseNotasPaginatedOptions<T> {
  cicloId: number | null;
  fetchFn: (cicloId: number, params?: Record<string, string | number>) => Promise<PaginatedResponse<T>>;
  enabled?: boolean;
}

interface UseNotasPaginatedReturn<T> {
  items: T[];
  count: number;
  page: number;
  setPage: (page: number) => void;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useNotasPaginated<T>({
  cicloId,
  fetchFn,
  enabled = true,
}: UseNotasPaginatedOptions<T>): UseNotasPaginatedReturn<T> {
  const [items, setItems] = useState<T[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (!cicloId || !enabled) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFn(cicloId, { page });
      if (!abortRef.current) {
        setItems(res.results);
        setCount(res.count);
      }
    } catch {
      if (!abortRef.current) setError('Error al cargar notas');
    } finally {
      if (!abortRef.current) setLoading(false);
    }
  }, [cicloId, page, fetchFn, enabled]);

  useEffect(() => {
    abortRef.current = false;
    fetchData();
    return () => { abortRef.current = true; };
  }, [fetchData]);

  // Reset page when cicloId changes
  useEffect(() => {
    setPage(1);
  }, [cicloId]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { items, count, page, setPage, loading, error, refetch };
}
