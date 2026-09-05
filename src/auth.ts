import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

/** `code` is the only field Auth.js forwards to the client (see
 * next-auth/react.js's signIn()) — encoding the wait time in it lets the
 * login form show an exact "N dakika sonra tekrar deneyin" message. */
class RateLimitedSignin extends CredentialsSignin {
  constructor(retryAfterSeconds: number) {
    super();
    this.code = `rate_limited:${retryAfterSeconds}`;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        // Checked (and counted) before the DB lookup so a botnet spreading
        // guesses for one victim email across many IPs is still caught by
        // the per-email bucket, and one IP spraying many emails is caught
        // by the per-IP bucket.
        const ip = await getClientIp();
        const ipLimit = await checkRateLimit("login", `ip:${ip}`);
        if (!ipLimit.allowed) throw new RateLimitedSignin(ipLimit.retryAfterSeconds);
        const emailLimit = await checkRateLimit("login", `email:${email.toLowerCase()}`);
        if (!emailLimit.allowed) throw new RateLimitedSignin(emailLimit.retryAfterSeconds);

        const user = await prisma.user.findUnique({
          where: { email },
          include: { business: { select: { id: true } } },
        });
        if (!user || !user.active) return null;

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl,
          role: user.role,
          businessId: user.business?.id ?? null,
        };
      },
    }),
  ],
});
