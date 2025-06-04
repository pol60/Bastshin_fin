// src/hooks/usePagination.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

const PAGE_SIZE = 20;

export function usePagination<T>(tableName: string, initialFilter: object = {}) {
  const [state, setState] = useState<{
    data: T[];
    currentPage: number;
    totalCount: number;
    isLoading: boolean;
    error: string | null;
  }>({
    data: [],
    currentPage: 0,
    totalCount: 0,
    isLoading: false,
    error: null
  });

  const filterRef = useRef(initialFilter);

  const fetchPage = useCallback(async (page: number) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const query = supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .range(from, to)
        .match(filterRef.current);

      const { data, count, error } = await query;

      if (error) {
        throw error instanceof Error ? error : new Error(String(error));
      }

      setState({
        data: data as T[],
        currentPage: page,
        totalCount: count || 0,
        isLoading: false,
        error: null
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setState(prev => ({
        ...prev,
        error: errorMsg,
        isLoading: false
      }));
    }
  }, [tableName]);

  useEffect(() => {
    filterRef.current = initialFilter;
    fetchPage(0);
  }, [initialFilter]);

  return {
    ...state,
    totalPages: Math.ceil(state.totalCount / PAGE_SIZE),
    pageSize: PAGE_SIZE,
    fetchPage
  };
}
