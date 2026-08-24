import type { CSSProperties } from "react";
import { format, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { APPOINTMENT_STATUS_META } from "@/components/business/status-badge";
import type { AppointmentStatus } from "@/generated/prisma/client";

export const AGENDA_GRID_TEMPLATE = "56px repeat(7, minmax(120px, 1fr))";

const GRID_START_HOUR = 8;
const GRID_END_HOUR = 20;
const ROW_HEIGHT = 56;
const HOURS = Array.from({ length: GRID_END_HOUR - GRID_START_HOUR + 1 }, (_, i) => GRID_START_HOUR + i);

const HATCH_STYLE: CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(135deg, var(--border) 0, var(--border) 1px, transparent 1px, transparent 9px)",
};

export type AgendaAppointment = {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  customerName: string;
  serviceName: string;
};

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function WeekAgenda({ days, appointments }: { days: Date[]; appointments: AgendaAppointment[] }) {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const showNowLine = nowMinutes >= GRID_START_HOUR * 60 && nowMinutes <= GRID_END_HOUR * 60;
  const gridHeight = (GRID_END_HOUR - GRID_START_HOUR) * ROW_HEIGHT;

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <div className="min-w-[880px] p-3">
        <div className="grid" style={{ gridTemplateColumns: AGENDA_GRID_TEMPLATE }}>
          {/* time gutter */}
          <div className="relative" style={{ height: gridHeight }}>
            {HOURS.map((h, i) => (
              <span
                key={h}
                className="absolute right-2 -translate-y-1/2 text-[11px] text-muted-foreground"
                style={{ top: i * ROW_HEIGHT }}
              >
                {String(h).padStart(2, "0")}:00
              </span>
            ))}
          </div>

          {days.map((day) => {
            const isToday = isSameDay(day, now);
            const dayAppointments = appointments.filter((a) => isSameDay(a.date, day));

            return (
              <div
                key={day.toISOString()}
                className="relative border-l border-border"
                style={{ height: gridHeight, ...HATCH_STYLE }}
              >
                {/* hour gridlines */}
                {HOURS.map((h, i) => (
                  <div
                    key={h}
                    className="absolute inset-x-0 border-t border-border/60"
                    style={{ top: i * ROW_HEIGHT }}
                  />
                ))}

                {dayAppointments.map((a) => {
                  const start = timeToMinutes(a.startTime);
                  const end = Math.max(start + 20, timeToMinutes(a.endTime));
                  const top = ((start - GRID_START_HOUR * 60) / 60) * ROW_HEIGHT;
                  const height = ((end - start) / 60) * ROW_HEIGHT;
                  const meta = APPOINTMENT_STATUS_META[a.status];
                  return (
                    <div
                      key={a.id}
                      className={cn(
                        "absolute inset-x-0.5 overflow-hidden rounded-md px-1.5 py-1 text-[11px] leading-tight shadow-sm",
                        meta.className,
                      )}
                      style={{ top: Math.max(0, top), height: Math.max(18, height) }}
                    >
                      <p className="truncate font-semibold">{a.startTime} {a.customerName}</p>
                      <p className="truncate opacity-80">{a.serviceName}</p>
                    </div>
                  );
                })}

                {isToday && showNowLine && (
                  <div
                    className="absolute inset-x-0 z-10 flex items-center"
                    style={{ top: ((nowMinutes - GRID_START_HOUR * 60) / 60) * ROW_HEIGHT }}
                  >
                    <span className="rounded bg-red-500 px-1 py-px text-[9px] font-semibold text-white">
                      {format(now, "HH:mm")}
                    </span>
                    <div className="h-px flex-1 bg-red-500" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
