// src/lib/cache.ts
import { supabase } from './supabaseClient';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  version: string;
}

const DEFAULT_TTL = 5 * 60 * 1000;
const CACHE_VERSION = 'v1';

export async function cachedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttl: number = DEFAULT_TTL
): Promise<T> {
  if (typeof window === 'undefined') return queryFn();

  try {
    const storageKey = `${CACHE_VERSION}_${key}`;
    const cached = localStorage.getItem(storageKey);
    const now = Date.now();

    if (cached) {
      const item: CacheItem<T> = JSON.parse(cached);
      if (now - item.timestamp < item.ttl) {
        return item.data;
      }
    }

    const freshData = await queryFn();
    const cacheItem: CacheItem<T> = {
      data: freshData,
      timestamp: now,
      ttl,
      version: CACHE_VERSION,
    };

    localStorage.setItem(storageKey, JSON.stringify(cacheItem));
    return freshData;
  } catch (error) {
    console.error('Cache error:', error);
    return queryFn();
  }
}

// Пример использования с Supabase
export const getCachedProducts = () => 
  cachedQuery('products', async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('in_stock', true);
    
    if (error) throw error instanceof Error ? error : new Error(String(error));
    return data;
  }, 10 * 60 * 1000);
