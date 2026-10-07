import "server-only";

/**
 * Fixed-window limiter, in memory. Best effort: on serverless each instance has
 * its own counter, so this slows a casual attacker but is not a hard guarantee.
 * For a hard limit put Vercel WAF or Upstash in front of /api/admin/login.
 */
const hits = new Map<string, { n: number; reset: number }>();

export function rateLimit(id: string, max: number, windowMs: number): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  if (hits.size > 5000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
  const cur = hits.get(id);
  if (!cur || cur.reset < now) {
    hits.set(id, { n: 1, reset: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  cur.n++;
  return { ok: cur.n <= max, retryAfter: Math.ceil((cur.reset - now) / 1000) };
}

export function clientIp(req: Request): string {
  return req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}
