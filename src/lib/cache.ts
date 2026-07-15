// Simple in-memory cache for API responses
// Helps with Neon PostgreSQL cold starts on Vercel serverless

const cache = new Map<string, { data: any; expiry: number }>();

export function getCached<T>(key: string, fetcher: () => Promise<T>, ttlSeconds: number = 30): Promise<T> {
  const now = Date.now();
  const cached = cache.get(key);

  if (cached && cached.expiry > now) {
    return Promise.resolve(cached.data as T);
  }

  return fetcher().then((data) => {
    cache.set(key, { data, expiry: now + ttlSeconds * 1000 });
    return data;
  });
}

export function invalidateCache(pattern?: string) {
  if (!pattern) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
}
