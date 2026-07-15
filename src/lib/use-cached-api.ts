"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useCache } from "@/lib/cache-provider";

export function useCachedApi<T>(url: string, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cache = useCache();
  const mounted = useRef(true);

  const fetcher = useCallback(() => fetch(url).then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  }), [url]);

  const load = useCallback(async (force = false) => {
    try {
      if (!force) {
        const cached = cache.get<T>(url);
        if (cached !== null) {
          setData(cached);
          setLoading(false);
          return;
        }
      }
      setLoading(true);
      const result = await fetcher();
      cache.set(url, result);
      if (mounted.current) {
        setData(result);
        setError(null);
      }
    } catch (e: any) {
      if (mounted.current) setError(e.message);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [url, fetcher, cache]);

  useEffect(() => {
    mounted.current = true;
    load();
    return () => { mounted.current = false; };
  }, [load, ...deps]);

  const refetch = useCallback(() => load(true), [load]);
  const invalidate = useCallback(() => { cache.invalidate(url); load(true); }, [cache, url, load]);

  return { data, loading, error, refetch, invalidate };
}
