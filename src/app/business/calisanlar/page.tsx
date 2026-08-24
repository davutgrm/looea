import { requireBusiness } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/business/page-header";
import { StaffManager } from "@/components/business/staff-manager";

export default async function CalisanlarPage() {
  const { businessId } = await requireBusiness();

  const [staff, services] = await Promise.all([
    prisma.businessStaff.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
      include: {
        services: { include: { service: { select: { name: true } } } },
        schedules: true,
        timeOff: { orderBy: { startDate: "asc" } },
      },
    }),
    prisma.service.findMany({
      where: { businessId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const staffRows = staff.map((s) => ({
    id: s.id,
    name: s.name,
    title: s.title,
    avatarUrl: s.avatarUrl,
    active: s.active,
    serviceIds: s.services.map((x) => x.serviceId),
    serviceNames: s.services.map((x) => x.service.name),
    schedule: s.schedules.map((sch) => ({
      dayOfWeek: sch.dayOfWeek,
      startTime: sch.startTime,
      endTime: sch.endTime,
    })),
    timeOff: s.timeOff.map((t) => ({
      id: t.id,
      startDate: t.startDate.toISOString(),
      endDate: t.endDate.toISOString(),
      reason: t.reason,
    })),
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Çalışanlar" />

      <StaffManager staff={staffRows} serviceOptions={services} />
    </div>
  );
}
