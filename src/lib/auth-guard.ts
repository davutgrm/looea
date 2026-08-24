import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/giris");
  return session.user;
}

export async function requireRole(role: "BUSINESS_OWNER" | "ADMIN") {
  const user = await requireUser();
  if (user.role !== role) redirect("/");
  return user;
}

/** Business dashboard pages must always scope queries to this businessId —
 * never trust a business id coming from the client. */
export async function requireBusiness() {
  const user = await requireRole("BUSINESS_OWNER");
  if (!user.businessId) redirect("/isletme-kaydet");
  return { user, businessId: user.businessId };
}
