interface RateLimitEntry {
  timestamps: number[];
}

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterMs: number };

const store = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      entry.timestamps = entry.timestamps.filter((t) => now - t < CLEANUP_INTERVAL_MS);
      if (entry.timestamps.length === 0) {
        store.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);

  if (typeof timer === "object" && "unref" in timer) {
    timer.unref();
  }
}

export function checkRateLimit(
  key: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key) ?? { timestamps: [] };

  entry.timestamps = entry.timestamps.filter(
    (t) => now - t < options.windowMs
  );

  if (entry.timestamps.length >= options.maxRequests) {
    const oldest = entry.timestamps[0];
    const retryAfterMs = oldest + options.windowMs - now;
    return { allowed: false, retryAfterMs };
  }

  entry.timestamps.push(now);
  store.set(key, entry);
  return { allowed: true };
}

export function _resetStore(): void {
  store.clear();
}
