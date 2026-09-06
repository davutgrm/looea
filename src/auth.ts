import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
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
    // Google ile giriş — yalnızca müşteri tarafı auth ekranlarında gösterilir
    // (Google ile açılan hesaplar CUSTOMER olur; işletme sahipleri /isletme-kaydet
    // ile kaydolur). Env yoksa sağlayıcı hiç eklenmez → çalışmayan buton oluşmaz.
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    ...authConfig.callbacks,
    // Google ilk girişinde: e-postaya göre kullanıcıyı bul, yoksa CUSTOMER olarak
    // oluştur. passwordHash rastgele/kullanılamaz bir değer alır (bu hesap yalnızca
    // Google ile açılır) — veri modeli değişmeden zorunlu alan doldurulur. Aynı
    // e-posta credentials ile kayıtlıysa parolaya dokunulmadan hesaba bağlanır.
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;
      const email = user.email?.toLowerCase();
      if (!email) return false;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return existing.active;

      await prisma.user.create({
        data: {
          email,
          name: user.name?.trim() || email.split("@")[0],
          passwordHash: await bcrypt.hash(crypto.randomUUID(), 10),
          avatarUrl: user.image ?? null,
          role: "CUSTOMER",
          onboardingCompleted: false,
        },
      });
      return true;
    },
    async jwt({ token, user, account }) {
      // Credentials: authorize() DB alanlarını user'a koydu.
      if (user && account?.provider !== "google") {
        token.id = user.id;
        token.role = user.role;
        token.businessId = user.businessId ?? null;
        return token;
      }
      // Google: ilk girişte DB kullanıcısını e-postayla bul, kimlik/rolü yükle.
      if (account?.provider === "google" && user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email.toLowerCase() },
          include: { business: { select: { id: true } } },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.businessId = dbUser.business?.id ?? null;
        }
      }
      return token;
    },
  },
});
