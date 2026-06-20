// In-memory anonymous rate limiter for the chat backend.
//
// No external dependencies and no Redis — this lives in module scope, so it is
// per-process (fine for a single-node deployment; for multi-node, swap the Map
// for a shared store behind the same `checkRateLimit` signature).
//
// Anonymous clients (keyed by IP) get the lower cap; logged-in sessions get a
// higher cap. The cap is enforced with a fixed-window bucket per key.

export interface RateLimitResult {
  allowed: boolean;
  /** How many more requests this key can make in the current window. */
  remaining: number;
  /** Seconds until the bucket resets (0 when already reset). */
  resetSeconds: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

export const ANONYMOUS_LIMIT = {
  // A demo chat has to let a curious visitor actually explore it. 10/hour was
  // tight enough that anyone poking the model for a few minutes hit the cap and
  // saw "no answer". 40/hour still blunts abuse but lets people play.
  max: 40,
  windowMs: 60 * 60 * 1000, // 1 hour
} as const;

export const AUTHED_LIMIT = {
  max: 60,
  windowMs: 60 * 60 * 1000, // 1 hour
} as const;

// Cap memory growth: if the map exceeds this, drop the single oldest entry.
// A real abuse burst will churn but never unbounded-OOM the process.
const MAX_ENTRIES = 10_000;

const buckets = new Map<string, Bucket>();

export function checkRateLimit(key: string, authed: boolean): RateLimitResult {
  const limit = authed ? AUTHED_LIMIT : ANONYMOUS_LIMIT;
  const now = Date.now();

  const existing = buckets.get(key);
  let bucket: Bucket;

  if (!existing || now > existing.resetAt) {
    // Fresh window.
    bucket = { count: 0, resetAt: now + limit.windowMs };
    buckets.set(key, bucket);
  } else {
    bucket = existing;
  }

  const resetSeconds = Math.max(0, Math.ceil((bucket.resetAt - now) / 1000));

  if (bucket.count >= limit.max) {
    // Enforce eviction only on insert path to keep the hot path cheap.
    evictIfTooLarge();
    return { allowed: false, remaining: 0, resetSeconds };
  }

  bucket.count += 1;
  evictIfTooLarge();
  return {
    allowed: true,
    remaining: Math.max(0, limit.max - bucket.count),
    resetSeconds,
  };
}

function evictIfTooLarge(): void {
  if (buckets.size <= MAX_ENTRIES) return;
  // Map iterates in insertion order; drop the first (oldest) entry.
  const oldest = buckets.keys().next();
  if (!oldest.done && oldest.value !== undefined) {
    buckets.delete(oldest.value);
  }
}
