"use server";

import { getAvailability, mergeAnyStaffSlots } from "@/lib/availability";
import { parseDateOnly } from "@/lib/date";

export async function fetchAvailability(params: {
  businessId: string;
  serviceId: string;
  date: string; // yyyy-mm-dd
  staffId?: string | null;
}) {
  const day = parseDateOnly(params.date);

  const perStaff = await getAvailability({
    businessId: params.businessId,
    serviceIds: [params.serviceId],
    date: day,
    staffId: params.staffId,
  });

  return { perStaff, merged: mergeAnyStaffSlots(perStaff) };
}

/** Same as fetchAvailability but for a multi-service visit (business panel's
 * manual appointment flow) — the returned slots fit the combined duration of
 * every selected service, and eligible staff can perform all of them. */
export async function fetchAvailabilityForServices(params: {
  businessId: string;
  serviceIds: string[];
  date: string; // yyyy-mm-dd
  staffId?: string | null;
}) {
  const day = parseDateOnly(params.date);

  const perStaff = await getAvailability({
    businessId: params.businessId,
    serviceIds: params.serviceIds,
    date: day,
    staffId: params.staffId,
  });

  return { perStaff, merged: mergeAnyStaffSlots(perStaff) };
}
