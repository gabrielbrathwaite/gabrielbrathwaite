/**
 * rateLimit — a tiny in-memory, per-key sliding-window limiter.
 *
 * Deliberately dependency-free. State lives in the server process, so it resets
 * on redeploy and isn't shared across serverless instances — which is fine for
 * a contact form: it's a speed bump against accidental double-submits and crude
 * spam, not a security boundary. If abuse ever becomes real, swap this for an
 * Upstash/Redis limiter behind the same function signature.
 */
type Hit = { count: number; resetAt: number };
const buckets = new Map<string, Hit>();

export function rateLimit(
  key: string,
  { max = 3, windowMs = 10 * 60 * 1000 } = {}
): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  const hit = buckets.get(key);

  if (!hit || now > hit.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }

  if (hit.count >= max) {
    return { ok: false, retryAfterSec: Math.ceil((hit.resetAt - now) / 1000) };
  }

  hit.count += 1;
  return { ok: true, retryAfterSec: 0 };
}
