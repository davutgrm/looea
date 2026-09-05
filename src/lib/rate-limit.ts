import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { RATE_LIMITS, type RateLimitName } from "@/lib/rate-limit-config";

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

/** Atomic fixed-window counter: one row per key, reset when the window has
 * elapsed. The INSERT..ON CONFLICT is a single statement so concurrent
 * requests for the same key can't race past the limit. */
export async function checkRateLimit(name: RateLimitName, identifier: string): Promise<RateLimitResult> {
  const { limit, windowSeconds } = RATE_LIMITS[name];
  const key = `${name}:${identifier}`;
  const now = new Date();
  const cutoff = new Date(now.getTime() - windowSeconds * 1000);

  const rows = await prisma.$queryRaw<{ count: number; windowStart: Date }[]>`
    INSERT INTO "RateLimitBucket" AS rlb ("key", "count", "windowStart")
    VALUES (${key}, 1, ${now})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN rlb."windowStart" <= ${cutoff} THEN 1 ELSE rlb."count" + 1 END,
      "windowStart" = CASE WHEN rlb."windowStart" <= ${cutoff} THEN ${now} ELSE rlb."windowStart" END
    RETURNING "count", "windowStart";
  `;
  const row = rows[0];

  if (row.count > limit) {
    const elapsed = Math.floor((now.getTime() - row.windowStart.getTime()) / 1000);
    return { allowed: false, retryAfterSeconds: Math.max(1, windowSeconds - elapsed) };
  }
  return { allowed: true };
}

/** Vercel/most proxies set x-forwarded-for to "client, proxy1, proxy2". */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}
