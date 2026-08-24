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
    serviceId: params.serviceId,
    date: day,
    staffId: params.staffId,
  });

  return { perStaff, merged: mergeAnyStaffSlots(perStaff) };
}
