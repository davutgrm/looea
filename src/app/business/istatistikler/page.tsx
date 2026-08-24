import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { tr } from "date-fns/locale";
import { requireBusiness } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/business/page-header";
import { APPOINTMENT_STATUS_META } from "@/components/business/status-badge";
import { Price } from "@/components/business/price";
import type { AppointmentStatus } from "@/generated/prisma/client";

export default async function IstatistiklerPage() {
  const { businessId } = await requireBusiness();

  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => subMonths(now, 5 - i));

  const [statusCountsRaw, monthlyRevenue, popularServicesRaw] = await Promise.all([
    prisma.appointment.groupBy({
      by: ["status"],
      where: { businessId },
      _count: { status: true },
    }),
    Promise.all(
      months.map(async (m) => {
        const agg = await prisma.appointment.aggregate({
          where: { businessId, status: "COMPLETED", date: { gte: startOfMonth(m), lte: endOfMonth(m) } },
          _sum: { price: true },
        });
        return { month: m, revenue: agg._sum.price ?? 0 };
      }),
    ),
    prisma.appointment.groupBy({
      by: ["serviceId"],
      where: { businessId, status: { not: "CANCELLED" } },
      _count: { serviceId: true },
      orderBy: { _count: { serviceId: "desc" } },
      take: 10,
    }),
  ]);

  const statusCounts = statusCountsRaw.reduce(
    (acc, s) => ({ ...acc, [s.status]: s._count.status }),
    {} as Record<AppointmentStatus, number>,
  );
  const totalAppointments = statusCountsRaw.reduce((sum, s) => sum + s._count.status, 0);

  const serviceIds = popularServicesRaw.map((s) => s.serviceId);
  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds } },
    select: { id: true, name: true },
  });
  const serviceNameMap = new Map(services.map((s) => [s.id, s.name]));
  const serviceRanking = popularServicesRaw.map((s) => ({
    name: serviceNameMap.get(s.serviceId) ?? "Silinmiş hizmet",
    count: s._count.serviceId,
  }));
  const maxServiceCount = Math.max(1, ...serviceRanking.map((s) => s.count));
  const maxRevenue = Math.max(1, ...monthlyRevenue.map((m) => m.revenue));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="İstatistikler" />

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Durumlara Göre Randevu Sayısı</CardTitle>
          <span className="text-sm text-muted-foreground">Toplam {totalAppointments} randevu</span>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {(Object.keys(APPOINTMENT_STATUS_META) as AppointmentStatus[]).map((status) => (
            <div key={status} className="flex flex-col gap-1 rounded-lg border border-border p-3">
              <span className="text-xs text-muted-foreground">{APPOINTMENT_STATUS_META[status].label}</span>
              <span className="font-heading text-xl font-semibold">{statusCounts[status] ?? 0}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Aylık Gelir (Son 6 Ay)</CardTitle>
          <CardDescription>Tamamlanan randevulardan elde edilen gelir</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {monthlyRevenue.map((m) => (
            <div key={m.month.toISOString()} className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-xs text-muted-foreground capitalize">
                {format(m.month, "MMM yyyy", { locale: tr })}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-app-accent"
                  style={{ width: `${Math.max(3, Math.round((m.revenue / maxRevenue) * 100))}%` }}
                />
              </div>
              <span className="w-24 shrink-0 text-right text-sm font-medium">
                <Price amount={m.revenue} />
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hizmet Sıralaması</CardTitle>
          <CardDescription>Randevu sayısına göre en çok tercih edilen hizmetler</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {serviceRanking.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Henüz veri yok.</p>
          ) : (
            serviceRanking.map((s, idx) => (
              <div key={s.name} className="flex items-center gap-3">
                <span className="w-5 shrink-0 text-xs text-muted-foreground">{idx + 1}.</span>
                <span className="w-40 shrink-0 truncate text-sm">{s.name}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-app-accent"
                    style={{ width: `${Math.max(4, Math.round((s.count / maxServiceCount) * 100))}%` }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right text-sm font-medium">{s.count}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
