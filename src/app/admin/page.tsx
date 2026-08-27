import Link from "next/link";
import { startOfMonth, endOfMonth, formatDistanceToNow, format } from "date-fns";
import { tr } from "date-fns/locale";
import {
  Users,
  Building2,
  BadgeCheck,
  CalendarDays,
  CalendarCheck,
  CreditCard,
  Wallet,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { appointmentCustomerName } from "@/lib/appointment-display";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { BarList } from "@/components/admin/bar-list";
import { EmptyState } from "@/components/admin/empty-state";
import { Price } from "@/components/admin/price";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APPOINTMENT_STATUS_LABELS } from "@/lib/business-types";

const ROLE_LABELS: Record<string, string> = {
  CUSTOMER: "Müşteri",
  BUSINESS_OWNER: "İşletme Sahibi",
  ADMIN: "Admin",
};

export default async function AdminDashboardPage() {
  await requireRole("ADMIN");

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [
    totalUsers,
    totalBusinesses,
    activeBusinesses,
    totalAppointments,
    appointmentsThisMonth,
    activeSubscriptions,
    revenueAgg,
    recentUsers,
    recentAppointments,
    statusBreakdownRaw,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.business.count(),
    prisma.business.count({ where: { active: true } }),
    prisma.appointment.count(),
    prisma.appointment.count({ where: { date: { gte: monthStart, lte: monthEnd } } }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "SUCCEEDED", createdAt: { gte: monthStart, lte: monthEnd } },
    }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.appointment.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        business: { select: { name: true } },
        customer: { select: { name: true } },
        businessCustomer: { select: { name: true } },
      },
    }),
    prisma.appointment.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const statusCounts = new Map(statusBreakdownRaw.map((s) => [s.status, s._count._all]));
  const statusItems = Object.entries(APPOINTMENT_STATUS_LABELS).map(([status, label]) => ({
    label,
    value: statusCounts.get(status as keyof typeof APPOINTMENT_STATUS_LABELS) ?? 0,
  }));

  const monthlyRevenue = revenueAgg._sum.amount ?? 0;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Kuafi platformunun genel durumuna göz atın."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <StatCard label="Toplam Kullanıcı" value={totalUsers.toLocaleString("tr-TR")} icon={Users} />
        <StatCard
          label="Toplam İşletme"
          value={totalBusinesses.toLocaleString("tr-TR")}
          icon={Building2}
          hint={`${activeBusinesses.toLocaleString("tr-TR")} aktif`}
        />
        <StatCard
          label="Aktif İşletme"
          value={activeBusinesses.toLocaleString("tr-TR")}
          icon={BadgeCheck}
        />
        <StatCard
          label="Toplam Randevu"
          value={totalAppointments.toLocaleString("tr-TR")}
          icon={CalendarDays}
        />
        <StatCard
          label="Bu Ay Randevular"
          value={appointmentsThisMonth.toLocaleString("tr-TR")}
          icon={CalendarCheck}
          hint={format(now, "MMMM yyyy", { locale: tr })}
        />
        <StatCard
          label="Aktif Abonelikler"
          value={activeSubscriptions.toLocaleString("tr-TR")}
          icon={CreditCard}
        />
        <StatCard
          label="Aylık Platform Geliri"
          value={<Price amount={monthlyRevenue} />}
          icon={Wallet}
          hint={format(now, "MMMM yyyy", { locale: tr })}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Randevu Durumu Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            <BarList items={statusItems} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Son Kayıt Olanlar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentUsers.length === 0 && <EmptyState icon={Users} title="Henüz kullanıcı yok" />}
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{u.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <Badge variant="outline">{ROLE_LABELS[u.role] ?? u.role}</Badge>
                  <span className="text-[11px] text-muted-foreground">
                    {formatDistanceToNow(u.createdAt, { addSuffix: true, locale: tr })}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Son Randevular</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAppointments.length === 0 && (
              <EmptyState icon={CalendarDays} title="Henüz randevu yok" />
            )}
            {recentAppointments.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{a.business.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{appointmentCustomerName(a)}</p>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {APPOINTMENT_STATUS_LABELS[a.status]}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 text-right">
        <Link href="/admin/randevular" className="text-sm text-primary hover:underline">
          Tüm randevuları görüntüle →
        </Link>
      </div>
    </div>
  );
}
