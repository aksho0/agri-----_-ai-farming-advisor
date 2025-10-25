import { CacheEntry } from '../types';

const CACHE_PREFIX = 'krishi-mitra-cache-';

export const cacheService = {
  set<T>(key: string, data: T): void {
    try {
      const entry: CacheEntry<T> = { data, timestamp: Date.now() };
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
    } catch (error) {
      console.error(`Error saving to cache [${key}]:`, error);
    }
  },

  get<T>(key: string): CacheEntry<T> | null {
    try {
      const item = localStorage.getItem(CACHE_PREFIX + key);
      if (item) {
        return JSON.parse(item) as CacheEntry<T>;
      }
      return null;
    } catch (error) {
      console.error(`Error reading from cache [${key}]:`, error);
      return null;
    }
  },
};
