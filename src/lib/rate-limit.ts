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

// LIMITATION: This in-memory store is NOT shared across serverless function instances.
// On Vercel, each invocation may run in a different process, so a user can bypass
// this rate limit by being routed to separate instances. For a production deployment
// with real abuse protection, replace this store with Upstash Redis:
//   npm install @upstash/ratelimit @upstash/redis
//   Vercel Marketplace auto-provisions UPSTASH_REDIS_REST_URL/TOKEN.
// For a demo, this still limits single-instance throughput (e.g., local dev, Docker).
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
