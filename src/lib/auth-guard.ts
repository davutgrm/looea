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

/** Ownership guards for the "fetch a record, confirm it belongs to the
 * caller" check every business/customer action needs before reading or
 * mutating it — centralized so a call site can't invert the comparison. */
export function isOwnedByBusiness<T extends { businessId: string }>(
  record: T | null | undefined,
  businessId: string,
): record is T {
  return !!record && record.businessId === businessId;
}

export function isOwnedByCustomer<T extends { customerId: string | null }>(
  record: T | null | undefined,
  customerId: string,
): record is T {
  return !!record && record.customerId === customerId;
}
