/** An appointment's customer is either a real registered User or a
 * business-managed contact (walk-in / manually added, no app account) —
 * exactly one of the two relations is set. These helpers pick whichever is
 * present for display. */
export function appointmentCustomerName(a: {
  customer?: { name: string } | null;
  businessCustomer?: { name: string | null } | null;
}): string {
  return a.customer?.name ?? a.businessCustomer?.name ?? "Müşteri";
}

export function appointmentCustomerPhone(a: {
  customer?: { phone: string | null } | null;
  businessCustomer?: { phone: string } | null;
}): string | null {
  return a.customer?.phone ?? a.businessCustomer?.phone ?? null;
}
