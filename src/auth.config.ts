import type { NextAuthConfig } from "next-auth";

// Cross-subdomain oturum: prod'da `AUTH_COOKIE_DOMAIN=.kuafi.com` set edilir ki
// müşteri (kuafi.com) ve pro (pro.kuafi.com) tarafları aynı oturumu paylaşsın.
// Env yoksa (dev / tek host) NextAuth varsayılan host-only cookie'lerini kullanır.
const cookieDomain = process.env.AUTH_COOKIE_DOMAIN;
const useSecure = process.env.NODE_ENV === "production";

const cookies: NextAuthConfig["cookies"] = cookieDomain
  ? {
      sessionToken: {
        name: useSecure ? "__Secure-authjs.session-token" : "authjs.session-token",
        options: {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: useSecure,
          domain: cookieDomain,
        },
      },
    }
  : undefined;

export const authConfig = {
  pages: {
    signIn: "/giris",
  },
  session: {
    strategy: "jwt",
  },
  ...(cookies ? { cookies } : {}),
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      if (pathname.startsWith("/admin")) {
        return isLoggedIn && auth?.user.role === "ADMIN";
      }
      if (pathname.startsWith("/business")) {
        return isLoggedIn && auth?.user.role === "BUSINESS_OWNER";
      }
      if (pathname.startsWith("/hesabim")) {
        return isLoggedIn;
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.businessId = user.businessId ?? null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "CUSTOMER" | "BUSINESS_OWNER" | "ADMIN";
        session.user.businessId = (token.businessId as string | null) ?? null;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
