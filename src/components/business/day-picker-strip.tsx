"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { format, isSameDay } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { AGENDA_GRID_TEMPLATE } from "./week-agenda";

export function DayPickerStrip({ days, selectedDate }: { days: Date[]; selectedDate: Date }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const today = new Date();

  function selectDay(day: Date) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", format(day, "yyyy-MM-dd"));
    params.set("view", "day");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="grid items-center gap-px" style={{ gridTemplateColumns: AGENDA_GRID_TEMPLATE }}>
      <div />
      {days.map((day) => {
        const isToday = isSameDay(day, today);
        const isSelected = isSameDay(day, selectedDate);
        return (
          <button
            key={day.toISOString()}
            type="button"
            onClick={() => selectDay(day)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl py-1.5 transition-colors hover:bg-muted",
              isSelected && !isToday && "bg-app-accent-soft",
            )}
          >
            <span className="text-[10px] font-medium text-muted-foreground uppercase">
              {format(day, "EEEEEE", { locale: tr })}
            </span>
            <span
              className={cn(
                "flex size-8 items-center justify-center rounded-full text-sm font-semibold",
                isToday ? "bg-app-accent text-app-accent-foreground" : "text-foreground",
              )}
            >
              {format(day, "d")}
            </span>
          </button>
        );
      })}
    </div>
  );
}
