interface Window {
  count: number;
  reset: number;
}

const buckets = new Map<string, Window>();

/**
 * Best-effort fixed-window per-key limiter. In-memory, so it resets on cold
 * starts — adequate as a basic abuse guard in front of the lead endpoint.
 */
export function rateLimit(
  key: string,
  limit = 5,
  windowMs = 60_000,
  now: number = Date.now(),
): boolean {
  const w = buckets.get(key);
  if (!w || now > w.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (w.count >= limit) return false;
  w.count += 1;
  return true;
}

/** Test helper — clears all windows. */
export function _resetRateLimit(): void {
  buckets.clear();
}
