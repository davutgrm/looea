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

  if (view === "day") {
    const dayStart = startOfDay(baseDate);
    const dayEnd = endOfDay(baseDate);
    const appointments = await prisma.appointment.findMany({
      where: { businessId, date: { gte: dayStart, lte: dayEnd }, status: { not: "CANCELLED" } },
      orderBy: { startTime: "asc" },
      include: {
        customer: { select: { name: true } },
        service: { select: { name: true } },
        staff: { select: { name: true } },
      },
    });

    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Takvim" />
        <CalendarNav date={dateParam} view="day" />
        <Card>
          <CardContent className="flex flex-col gap-2.5">
            {appointments.length === 0 ? (
              <EmptyState icon={CalendarDays} title="Bu tarihte randevu yok" />
            ) : (
              appointments.map((a) => (
                <AppointmentCard
                  key={a.id}
                  id={a.id}
                  customerName={a.customer.name}
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
      service: { select: { name: true } },
      staff: { select: { name: true } },
    },
  });

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Takvim" />
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
          customerName: a.customer.name,
          serviceName: a.service.name,
        }))}
      />
    </div>
  );
}
