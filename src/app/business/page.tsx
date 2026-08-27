import Link from "next/link";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { tr } from "date-fns/locale";
import { CalendarCheck, CalendarRange, Users, Wallet, ArrowUpRight, Sparkles, TrendingUp } from "lucide-react";
import { requireBusiness } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { appointmentCustomerName } from "@/lib/appointment-display";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/business/page-header";
import { StatRow } from "@/components/business/stat-card";
import { EmptyState } from "@/components/business/empty-state";
import { SetupChecklist } from "@/components/business/setup-checklist";
import { AppointmentStatusBadge } from "@/components/business/status-badge";
import { Price } from "@/components/business/price";
import { AvailabilityToggle } from "@/components/business/availability-toggle";
import { ProfileIncompleteBanner } from "@/components/business/profile-banner";

export default async function BusinessOverviewPage() {
  const { businessId } = await requireBusiness();

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  const [
    business,
    location,
    hours,
    servicesCount,
    staffCount,
    portfolioCount,
    todayCount,
    weekCount,
    distinctCustomers,
    monthRevenueAgg,
    lastMonthRevenueAgg,
    upcoming,
    popularServicesRaw,
  ] = await Promise.all([
    prisma.business.findUniqueOrThrow({
      where: { id: businessId },
      select: { slug: true, description: true, phone: true, availableNow: true, availableNowUntil: true },
    }),
    prisma.businessLocation.findUnique({ where: { businessId } }),
    prisma.businessHours.findMany({ where: { businessId } }),
    prisma.service.count({ where: { businessId } }),
    prisma.businessStaff.count({ where: { businessId } }),
    prisma.portfolioImage.count({ where: { businessId } }),
    prisma.appointment.count({
      where: { businessId, date: { gte: todayStart, lte: todayEnd }, status: { not: "CANCELLED" } },
    }),
    prisma.appointment.count({
      where: { businessId, date: { gte: weekStart, lte: weekEnd }, status: { not: "CANCELLED" } },
    }),
    prisma.appointment.findMany({
      where: { businessId },
      select: { customerId: true, businessCustomerId: true },
      distinct: ["customerId", "businessCustomerId"],
    }),
    prisma.appointment.aggregate({
      where: { businessId, status: "COMPLETED", date: { gte: monthStart, lte: monthEnd } },
      _sum: { price: true },
    }),
    prisma.appointment.aggregate({
      where: { businessId, status: "COMPLETED", date: { gte: lastMonthStart, lte: lastMonthEnd } },
      _sum: { price: true },
    }),
    prisma.appointment.findMany({
      where: { businessId, date: { gte: todayStart }, status: { in: ["PENDING", "CONFIRMED"] } },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      take: 5,
      include: {
        customer: { select: { name: true } },
        businessCustomer: { select: { name: true } },
        service: { select: { name: true } },
        staff: { select: { name: true } },
      },
    }),
    prisma.appointment.groupBy({
      by: ["serviceId"],
      where: { businessId, status: { not: "CANCELLED" } },
      _count: { serviceId: true },
      orderBy: { _count: { serviceId: "desc" } },
      take: 5,
    }),
  ]);

  // "Şu an müsaitim" can be time-limited; self-heal the flag once it lapses
  // instead of relying on a background job.
  if (business.availableNow && business.availableNowUntil && business.availableNowUntil < now) {
    await prisma.business.update({ where: { id: businessId }, data: { availableNow: false, availableNowUntil: null } });
    business.availableNow = false;
  }

  const serviceIds = popularServicesRaw.map((s) => s.serviceId);
  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds } },
    select: { id: true, name: true },
  });
  const serviceNameMap = new Map(services.map((s) => [s.id, s.name]));
  const popularServices = popularServicesRaw.map((s) => ({
    name: serviceNameMap.get(s.serviceId) ?? "Silinmiş hizmet",
    count: s._count.serviceId,
  }));
  const maxPopularCount = Math.max(1, ...popularServices.map((s) => s.count));

  const monthRevenue = monthRevenueAgg._sum.price ?? 0;
  const lastMonthRevenue = lastMonthRevenueAgg._sum.price ?? 0;
  const revenueDelta = monthRevenue - lastMonthRevenue;
  const revenueDeltaPct =
    lastMonthRevenue > 0 ? Math.round((revenueDelta / lastMonthRevenue) * 100) : monthRevenue > 0 ? 100 : 0;

  const profileComplete = !!business.description && !!business.phone && !!location;
  const hoursConfigured = hours.some((h) => !h.isClosed);
  const coreSetupDone = profileComplete && servicesCount > 0 && staffCount > 0 && hoursConfigured && portfolioCount > 0;

  // The core discoverability requirements (address, hours, at least one service) get the
  // top banner; once those are done the fuller checklist takes over for the rest — never both.
  const discoverable = !!location && hoursConfigured && servicesCount > 0;

  const setupItems = [
    { label: "Profil bilgilerini tamamla", done: profileComplete, href: "/business/ayarlar" },
    { label: "Hizmet ekle", done: servicesCount > 0, href: "/business/hizmetler" },
    { label: "Çalışan ekle", done: staffCount > 0, href: "/business/calisanlar" },
    { label: "Çalışma saatlerini ayarla", done: hoursConfigured, href: "/business/ayarlar" },
    { label: "Portföy fotoğrafı yükle", done: portfolioCount > 0, href: "/business/portfoy" },
    { label: "Profil linkini paylaş", done: coreSetupDone, href: `/isletme/${business.slug}` },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Genel Bakış" />

      {!discoverable && <ProfileIncompleteBanner href="/business/ayarlar" />}

      <AvailabilityToggle initialAvailable={business.availableNow} />

      {discoverable && <SetupChecklist items={setupItems} />}

      <StatRow
        stats={[
          { icon: CalendarCheck, label: "Bugünkü Randevular", value: todayCount },
          { icon: CalendarRange, label: "Bu Haftaki Randevular", value: weekCount },
          { icon: Users, label: "Toplam Müşteri", value: distinctCustomers.length },
          {
            icon: Wallet,
            label: "Aylık Gelir",
            value: <Price amount={monthRevenue} />,
            hint: lastMonthRevenue > 0 ? `Geçen aya göre ${revenueDelta >= 0 ? "+" : ""}${revenueDeltaPct}%` : undefined,
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Yaklaşan Randevular</CardTitle>
            <Link
              href="/business/randevular"
              className="inline-flex items-center gap-1 text-sm font-medium text-app-accent hover:underline"
            >
              Tümü <ArrowUpRight className="size-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {upcoming.length === 0 ? (
              <EmptyState
                icon={CalendarCheck}
                title="Yaklaşan randevu yok"
                description="Onaylanmış veya bekleyen randevular burada görünecek."
                action={
                  <Link href={`/isletme/${business.slug}`} className="text-sm font-medium text-app-accent hover:underline">
                    Profil linkini paylaş
                  </Link>
                }
              />
            ) : (
              upcoming.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="size-8 shrink-0">
                      <AvatarFallback className="bg-app-accent-soft text-app-accent-soft-foreground">
                        {appointmentCustomerName(a)[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium">{appointmentCustomerName(a)}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {a.service.name}
                        {a.staff ? ` · ${a.staff.name}` : ""}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-sm font-medium">
                      {format(a.date, "d MMM", { locale: tr })} · {a.startTime}
                    </span>
                    <AppointmentStatusBadge status={a.status} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Popüler Hizmetler</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {popularServices.length === 0 ? (
              <EmptyState
                icon={TrendingUp}
                title="Henüz veri yok"
                description="Randevular biriktikçe en çok tercih edilen hizmetler burada listelenecek."
                action={
                  <Link href="/business/hizmetler" className="text-sm font-medium text-app-accent hover:underline">
                    Hizmet ekle
                  </Link>
                }
              />
            ) : (
              popularServices.map((s) => (
                <div key={s.name} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate font-medium">{s.name}</span>
                    <Badge variant="secondary">{s.count}</Badge>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-app-accent"
                      style={{ width: `${Math.max(6, Math.round((s.count / maxPopularCount) * 100))}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-app-accent" /> Gelir Özeti
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1 rounded-xl border border-border p-4">
            <span className="text-xs text-muted-foreground">Bu Ay ({format(now, "MMMM yyyy", { locale: tr })})</span>
            <span className="font-grotesk text-xl font-bold"><Price amount={monthRevenue} /></span>
          </div>
          <div className="flex flex-col gap-1 rounded-xl border border-border p-4">
            <span className="text-xs text-muted-foreground">
              Geçen Ay ({format(lastMonthStart, "MMMM yyyy", { locale: tr })})
            </span>
            <span className="font-grotesk text-xl font-bold"><Price amount={lastMonthRevenue} /></span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
