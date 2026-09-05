/** All rate limit thresholds in one place. Every limit is enforced twice —
 * once per IP, once per the identity being targeted (email) — so neither a
 * single IP rotating targets nor a botnet hammering one account gets through.
 * Client-safe (no server-only imports): also used by client components to
 * format the "try again in N minutes" message. */
export const RATE_LIMITS = {
  /** Failed or successful credential attempts. Unlimited = brute-force /
   * credential-stuffing account takeover. */
  login: { limit: 5, windowSeconds: 15 * 60 },
  /** New customer accounts. Unlimited = spam accounts, bcrypt-hashing cost
   * (10 rounds per attempt) as a cheap CPU-exhaustion lever. */
  registerCustomer: { limit: 5, windowSeconds: 60 * 60 },
  /** New business signups (heavier: creates Business+Location+Hours+trial
   * Subscription in one transaction). Unlimited = fake listings polluting
   * discovery pages, free-trial farming. */
  registerBusiness: { limit: 3, windowSeconds: 60 * 60 },
  /** Password reset requests. Currently a stub (no real email sent yet), but
   * limited now so nobody forgets when SMTP goes live — unlimited = email
   * bombing a victim's inbox. */
  passwordReset: { limit: 3, windowSeconds: 60 * 60 },
} as const;

export type RateLimitName = keyof typeof RATE_LIMITS;

export function formatRetryAfter(seconds: number): string {
  if (seconds < 60) return `${seconds} saniye`;
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) return `${minutes} dakika`;
  return `${Math.ceil(minutes / 60)} saat`;
}
