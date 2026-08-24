import { startOfDay, endOfDay, format } from "date-fns";
import { tr } from "date-fns/locale";
import { CalendarCheck } from "lucide-react";
import { requireBusiness } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import type { Prisma, AppointmentStatus } from "@/generated/prisma/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/business/page-header";
import { EmptyState } from "@/components/business/empty-state";
import { AppointmentStatusBadge, APPOINTMENT_STATUS_META } from "@/components/business/status-badge";
import { AppointmentStatusActions } from "@/components/business/appointment-status-actions";
import { AppointmentFilters } from "@/components/business/appointment-filters";
import { Price } from "@/components/business/price";

export default async function RandevularPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; date?: string }>;
}) {
  const { businessId } = await requireBusiness();
  const params = await searchParams;

  const where: Prisma.AppointmentWhereInput = { businessId };

  if (params.status && params.status !== "ALL" && params.status in APPOINTMENT_STATUS_META) {
    where.status = params.status as AppointmentStatus;
  }

  if (params.date) {
    const day = new Date(params.date);
    if (!Number.isNaN(day.getTime())) {
      where.date = { gte: startOfDay(day), lte: endOfDay(day) };
    }
  }

  const appointments = await prisma.appointment.findMany({
    where,
    orderBy: [{ date: "desc" }, { startTime: "asc" }],
    include: {
      customer: { select: { name: true, phone: true } },
      service: { select: { name: true } },
      staff: { select: { name: true } },
    },
    take: 300,
  });

  const hasFilters = !!params.status || !!params.date;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Randevular" />

      <Card>
        <CardHeader className="gap-3">
          <div className="flex items-start justify-between gap-3">
            <AppointmentFilters />
            <span className="shrink-0 pt-2.5 text-sm text-muted-foreground">{appointments.length} randevu</span>
          </div>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title={hasFilters ? "Bu filtrelerle eşleşen randevu yok" : "Henüz randevu yok"}
              description={
                hasFilters
                  ? "Farklı bir durum veya tarih deneyin."
                  : "Müşteriler profilinizden randevu aldığında burada listelenecek."
              }
            />
          ) : (
            <div className="flex flex-col gap-2.5">
              {appointments.map((a) => (
                <div key={a.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="size-9 shrink-0">
                        <AvatarFallback className="bg-app-accent-soft text-app-accent-soft-foreground">
                          {a.customer.name[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{a.customer.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {a.service.name}
                          {a.staff ? ` · ${a.staff.name}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-sm font-medium">
                        {format(a.date, "d MMM yyyy", { locale: tr })} · {a.startTime}
                      </span>
                      <AppointmentStatusBadge status={a.status} />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                    <span className="text-sm text-muted-foreground">
                      <Price amount={a.price} />
                      {a.customer.phone ? ` · ${a.customer.phone}` : ""}
                    </span>
                    <AppointmentStatusActions id={a.id} status={a.status} size="xs" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
