import type { DefaultSession } from "next-auth";

type AppRole = "CUSTOMER" | "BUSINESS_OWNER" | "ADMIN";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: AppRole;
      businessId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: AppRole;
    businessId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: AppRole;
    businessId: string | null;
  }
}
