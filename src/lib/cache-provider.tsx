"use client";

import { createContext, useContext, useRef, useCallback, type ReactNode } from "react";

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

interface CacheContextType {
  get: <T>(key: string) => T | null;
  set: (key: string, data: unknown) => void;
  invalidate: (key: string) => void;
  prefetch: (key: string, fetcher: () => Promise<unknown>) => Promise<void>;
}

const CacheContext = createContext<CacheContextType | null>(null);

const TTL = 30_000; // 30 seconds

export function CacheProvider({ children }: { children: ReactNode }) {
  const cache = useRef<Map<string, CacheEntry>>(new Map());

  const get = useCallback(<T,>(key: string): T | null => {
    const entry = cache.current.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > TTL) {
      cache.current.delete(key);
      return null;
    }
    return entry.data as T;
  }, []);

  const set = useCallback((key: string, data: unknown) => {
    cache.current.set(key, { data, timestamp: Date.now() });
  }, []);

  const invalidate = useCallback((key: string) => {
    cache.current.delete(key);
  }, []);

  const prefetch = useCallback(async (key: string, fetcher: () => Promise<unknown>) => {
    if (cache.current.has(key)) return;
    try {
      const data = await fetcher();
      cache.current.set(key, { data, timestamp: Date.now() });
    } catch {
      // ignore prefetch errors
    }
  }, []);

  return (
    <CacheContext.Provider value={{ get, set, invalidate, prefetch }}>
      {children}
    </CacheContext.Provider>
  );
}

export function useCache() {
  const ctx = useContext(CacheContext);
  if (!ctx) throw new Error("useCache must be used within CacheProvider");
  return ctx;
}

export function useCachedFetch<T>(key: string, fetcher: () => Promise<T>) {
  const cache = useCache();
  const fetching = useRef<Map<string, Promise<T>>>(new Map());

  const getData = useCallback(async (force = false): Promise<T> => {
    if (!force) {
      const cached = cache.get<T>(key);
      if (cached !== null) return cached;
    }

    // Deduplicate in-flight requests
    if (fetching.current.has(key)) {
      return fetching.current.get(key)!;
    }

    const promise = fetcher().then((data) => {
      cache.set(key, data);
      fetching.current.delete(key);
      return data;
    }).catch((err) => {
      fetching.current.delete(key);
      throw err;
    });

    fetching.current.set(key, promise);
    return promise;
  }, [key, fetcher, cache]);

  return { getData, invalidate: () => cache.invalidate(key) };
}
