// Best-effort only: each serverless instance holds its own copy of this
// map, so it doesn't guarantee a hard cap across the whole deployment —
// but it does throttle the common case (one script/session hammering a
// single warm instance) without adding a database table or external
// service for what's a low-severity finding.
const attempts = new Map<string, { count: number; windowStart: number }>();

export function isRateLimited(key: string, maxAttempts: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    attempts.set(key, { count: 1, windowStart: now });
    return false;
  }

  entry.count += 1;
  return entry.count > maxAttempts;
}
