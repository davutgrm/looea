import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/giris",
  },
  session: {
    strategy: "jwt",
  },
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
