import { startOfDay, endOfDay, format } from "date-fns";
import { tr } from "date-fns/locale";
import { CalendarCheck } from "lucide-react";
import { requireBusiness } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/business/page-header";
import { EmptyState } from "@/components/business/empty-state";
import { AppointmentStatusBadge } from "@/components/business/status-badge";
import { AppointmentStatusActions } from "@/components/business/appointment-status-actions";
import { AppointmentFilters } from "@/components/business/appointment-filters";
import { Price } from "@/components/business/price";
import { PaymentMethodControl } from "@/components/business/payment-method-control";
import { WhatsAppButton } from "@/components/business/whatsapp-button";
import { ManualAppointmentButton } from "@/components/business/manual-appointment-dialog";
import { appointmentCustomerName, appointmentCustomerPhone } from "@/lib/appointment-display";
import { getManualBookingContext } from "@/lib/data/business-panel";

export default async function RandevularPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; date?: string }>;
}) {
  const { businessId } = await requireBusiness();
  const params = await searchParams;
  const status = params.status ?? "UPCOMING";

  const where: Prisma.AppointmentWhereInput = { businessId };

  if (status === "UPCOMING") where.status = { in: ["PENDING", "CONFIRMED"] };
  else if (status === "COMPLETED") where.status = "COMPLETED";
  else if (status === "CANCELLED") where.status = "CANCELLED";
  else if (status === "NO_SHOW") where.status = "NO_SHOW";

  if (params.date) {
    const day = new Date(params.date);
    if (!Number.isNaN(day.getTime())) {
      where.date = { gte: startOfDay(day), lte: endOfDay(day) };
    }
  }

  const [appointments, bookingContext] = await Promise.all([
    prisma.appointment.findMany({
      where,
      orderBy: [{ date: "desc" }, { startTime: "asc" }],
      include: {
        customer: { select: { name: true, phone: true } },
        businessCustomer: { select: { name: true, phone: true } },
        service: { select: { name: true } },
        staff: { select: { name: true } },
      },
      take: 300,
    }),
    getManualBookingContext(businessId),
  ]);

  // Manually-created multi-service visits share a groupId and are already
  // adjacent (same date, ascending startTime) — fold them into one card.
  const groups: (typeof appointments)[number][][] = [];
  for (const a of appointments) {
    const last = groups[groups.length - 1];
    if (a.groupId && last?.[0].groupId === a.groupId) last.push(a);
    else groups.push([a]);
  }

  const hasFilters = status !== "UPCOMING" || !!params.date;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Randevular"
        action={
          <ManualAppointmentButton
            businessId={businessId}
            customers={bookingContext.customers}
            services={bookingContext.services}
            staffOptions={bookingContext.staffOptions}
          />
        }
      />

      <Card>
        <CardHeader className="gap-3">
          <div className="flex items-start justify-between gap-3">
            <AppointmentFilters />
            <span className="shrink-0 pt-2.5 text-sm text-muted-foreground">{groups.length} randevu</span>
          </div>
        </CardHeader>
        <CardContent>
          {groups.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title={hasFilters ? "Bu filtrelerle eşleşen randevu yok" : "Henüz randevu yok"}
              description={
                hasFilters
                  ? "Farklı bir durum veya tarih deneyin."
                  : "Müşteriler profilinizden randevu aldığında veya + Randevu Ekle ile burada listelenecek."
              }
            />
          ) : (
            <div className="flex flex-col gap-2.5">
              {groups.map((group) => {
                const first = group[0];
                const last = group[group.length - 1];
                const name = appointmentCustomerName(first);
                const phone = appointmentCustomerPhone(first);
                const serviceNames = group.map((g) => g.service.name).join(" + ");
                const totalPrice = group.reduce((sum, g) => sum + g.price, 0);

                return (
                  <div key={first.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar className="size-9 shrink-0">
                          <AvatarFallback className="bg-app-accent-soft text-app-accent-soft-foreground">
                            {name[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {serviceNames}
                            {first.staff ? ` · ${first.staff.name}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className="text-sm font-medium">
                          {format(first.date, "d MMM yyyy", { locale: tr })} · {first.startTime}–{last.endTime}
                        </span>
                        <AppointmentStatusBadge status={first.status} />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                      <span className="text-sm text-muted-foreground">
                        <Price amount={totalPrice} />
                        {phone ? ` · ${phone}` : ""}
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <PaymentMethodControl appointmentId={first.id} paymentMethod={first.paymentMethod} />
                        <WhatsAppButton
                          phone={phone}
                          message={`Merhaba ${name !== "Müşteri" ? name : ""}, ${format(first.date, "d MMM", { locale: tr })} ${first.startTime} randevunuz için yazıyorum.`}
                        />
                        <AppointmentStatusActions id={first.id} status={first.status} size="xs" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
