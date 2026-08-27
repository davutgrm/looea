import { startOfDay, endOfDay, startOfWeek, endOfWeek, addDays, format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { requireBusiness } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/business/page-header";
import { EmptyState } from "@/components/business/empty-state";
import { CalendarNav } from "@/components/business/calendar-nav";
import { AppointmentCard } from "@/components/business/appointment-card";
import { DayPickerStrip } from "@/components/business/day-picker-strip";
import { WeekAgenda } from "@/components/business/week-agenda";
import { ManualAppointmentButton } from "@/components/business/manual-appointment-dialog";
import { BlockedSlotButton } from "@/components/business/blocked-slot-dialog";
import { BLOCK_REASON_LABELS } from "@/lib/block-reason";
import { DeleteBlockedSlotButton } from "@/components/business/delete-blocked-slot-button";
import { appointmentCustomerName } from "@/lib/appointment-display";
import { getManualBookingContext } from "@/lib/data/business-panel";

export default async function TakvimPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; view?: string }>;
}) {
  const { businessId } = await requireBusiness();
  const params = await searchParams;
  const view = params.view === "week" ? "week" : "day";
  const baseDate =
    params.date && !Number.isNaN(new Date(params.date).getTime()) ? new Date(params.date) : new Date();
  const dateParam = format(baseDate, "yyyy-MM-dd");

  const [bookingContext, staffOptions] = await Promise.all([
    getManualBookingContext(businessId),
    prisma.businessStaff.findMany({
      where: { businessId, active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const headerAction = (
    <div className="flex flex-wrap items-center gap-2">
      <BlockedSlotButton staffOptions={staffOptions} defaultDate={baseDate} />
      <ManualAppointmentButton
        businessId={businessId}
        customers={bookingContext.customers}
        services={bookingContext.services}
        staffOptions={bookingContext.staffOptions}
      />
    </div>
  );

  if (view === "day") {
    const dayStart = startOfDay(baseDate);
    const dayEnd = endOfDay(baseDate);
    const dayOfWeek = baseDate.getDay();
    const [appointments, blockedSlots] = await Promise.all([
      prisma.appointment.findMany({
        where: { businessId, date: { gte: dayStart, lte: dayEnd }, status: { not: "CANCELLED" } },
        orderBy: { startTime: "asc" },
        include: {
          customer: { select: { name: true } },
          businessCustomer: { select: { name: true } },
          service: { select: { name: true } },
          staff: { select: { name: true } },
        },
      }),
      prisma.blockedSlot.findMany({
        where: {
          businessId,
          OR: [
            { repeatWeekly: true, dayOfWeek },
            { repeatWeekly: false, date: { gte: dayStart, lte: dayEnd } },
          ],
        },
        orderBy: { startTime: "asc" },
        include: { staff: { select: { name: true } } },
      }),
    ]);

    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Takvim" action={headerAction} />
        <CalendarNav date={dateParam} view="day" />

        {blockedSlots.length > 0 && (
          <div className="flex flex-col gap-2">
            {blockedSlots.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-border bg-muted/40 px-3.5 py-2.5"
              >
                <span className="text-sm">
                  <span className="font-medium">
                    {b.startTime}–{b.endTime}
                  </span>{" "}
                  · {BLOCK_REASON_LABELS[b.reason]}
                  {b.label ? ` (${b.label})` : ""} · {b.staff?.name ?? "Tüm çalışanlar"}
                  {b.repeatWeekly ? " · Her hafta" : ""}
                </span>
                <DeleteBlockedSlotButton id={b.id} />
              </div>
            ))}
          </div>
        )}

        <Card>
          <CardContent className="flex flex-col gap-2.5">
            {appointments.length === 0 ? (
              <EmptyState icon={CalendarDays} title="Bu tarihte randevu yok" />
            ) : (
              appointments.map((a) => (
                <AppointmentCard
                  key={a.id}
                  id={a.id}
                  customerName={appointmentCustomerName(a)}
                  serviceName={a.service.name}
                  staffName={a.staff?.name ?? null}
                  time={a.startTime}
                  status={a.status}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(baseDate, { weekStartsOn: 1 });
  const appointments = await prisma.appointment.findMany({
    where: { businessId, date: { gte: weekStart, lte: weekEnd }, status: { not: "CANCELLED" } },
    orderBy: { startTime: "asc" },
    include: {
      customer: { select: { name: true } },
      businessCustomer: { select: { name: true } },
      service: { select: { name: true } },
      staff: { select: { name: true } },
    },
  });

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Takvim" action={headerAction} />
      <CalendarNav date={dateParam} view="week" />
      <DayPickerStrip days={days} selectedDate={baseDate} />
      <WeekAgenda
        days={days}
        appointments={appointments.map((a) => ({
          id: a.id,
          date: a.date,
          startTime: a.startTime,
          endTime: a.endTime,
          status: a.status,
          customerName: appointmentCustomerName(a),
          serviceName: a.service.name,
        }))}
      />
    </div>
  );
}
