import { prisma } from "@/lib/prisma";
import { servesForSegment } from "@/lib/business-types";

export type ManualBookingCustomer = {
  kind: "user" | "business";
  id: string;
  name: string;
  phone: string | null;
};

export type ManualBookingService = {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  staffIds: string[];
};

/** Everything the manual appointment wizard needs: this business's own
 * customer list (real accounts that have booked here + manually-added
 * contacts), its segment-filtered active services, and its active staff. */
export async function getManualBookingContext(businessId: string) {
  const [business, realCustomers, businessCustomers, services, staff] = await Promise.all([
    prisma.business.findUniqueOrThrow({ where: { id: businessId }, select: { serves: true } }),
    prisma.appointment.findMany({
      where: { businessId, customerId: { not: null } },
      distinct: ["customerId"],
      select: { customer: { select: { id: true, name: true, phone: true } } },
    }),
    prisma.businessCustomer.findMany({ where: { businessId }, orderBy: { createdAt: "desc" } }),
    prisma.service.findMany({
      where: { businessId, active: true },
      include: { category: { select: { serves: true } }, staff: { select: { staffId: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.businessStaff.findMany({ where: { businessId, active: true }, orderBy: { name: "asc" } }),
  ]);

  const visibleServes = servesForSegment(
    business.serves === "MEN" ? "MALE" : business.serves === "WOMEN" ? "FEMALE" : null,
  );

  const customers: ManualBookingCustomer[] = [
    ...realCustomers
      .map((r) => r.customer)
      .filter((c): c is { id: string; name: string; phone: string | null } => !!c)
      .map((c) => ({ kind: "user" as const, id: c.id, name: c.name, phone: c.phone })),
    ...businessCustomers.map((c) => ({
      kind: "business" as const,
      id: c.id,
      name: c.name ?? "İsimsiz müşteri",
      phone: c.phone as string | null,
    })),
  ];

  const visibleServices = visibleServes
    ? services.filter((s) => visibleServes.includes(s.category.serves))
    : services;

  return {
    customers,
    services: visibleServices.map(
      (s): ManualBookingService => ({
        id: s.id,
        name: s.name,
        price: s.price,
        durationMinutes: s.durationMinutes,
        staffIds: s.staff.map((x) => x.staffId),
      }),
    ),
    staffOptions: staff.map((s) => ({ id: s.id, name: s.name })),
  };
}
