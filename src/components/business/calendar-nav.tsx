"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { addDays, addWeeks, subDays, subWeeks, startOfWeek, endOfWeek, format } from "date-fns";
import { tr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

function weekRangeLabel(current: Date): string {
  const start = startOfWeek(current, { weekStartsOn: 1 });
  const end = endOfWeek(current, { weekStartsOn: 1 });
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${format(start, "d")}–${format(end, "d MMMM yyyy", { locale: tr })}`;
  }
  if (start.getFullYear() === end.getFullYear()) {
    return `${format(start, "d MMMM", { locale: tr })} – ${format(end, "d MMMM yyyy", { locale: tr })}`;
  }
  return `${format(start, "d MMMM yyyy", { locale: tr })} – ${format(end, "d MMMM yyyy", { locale: tr })}`;
}

export function CalendarNav({ date, view }: { date: string; view: "day" | "week" }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pickerOpen, setPickerOpen] = useState(false);

  function go(nextDate: string, nextView: "day" | "week") {
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", nextDate);
    params.set("view", nextView);
    router.push(`${pathname}?${params.toString()}`);
  }

  const current = new Date(`${date}T00:00:00`);

  function step(dir: -1 | 1) {
    const next =
      view === "day"
        ? dir === 1
          ? addDays(current, 1)
          : subDays(current, 1)
        : dir === 1
          ? addWeeks(current, 1)
          : subWeeks(current, 1);
    go(format(next, "yyyy-MM-dd"), view);
  }

  const label = view === "week" ? weekRangeLabel(current) : format(current, "d MMMM yyyy, EEEE", { locale: tr });

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-1.5">
        <Button variant="outline" size="icon" onClick={() => step(-1)}>
          <ChevronLeft className="size-4" />
        </Button>

        <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium capitalize transition-colors hover:bg-muted"
            >
              {label}
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              locale={tr}
              selected={current}
              onSelect={(d) => {
                if (!d) return;
                go(format(d, "yyyy-MM-dd"), view);
                setPickerOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>

        <Button variant="outline" size="icon" onClick={() => step(1)}>
          <ChevronRight className="size-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => go(format(new Date(), "yyyy-MM-dd"), view)}>
          Bugün
        </Button>
      </div>
      <Tabs value={view} onValueChange={(v) => go(date, v as "day" | "week")}>
        <TabsList>
          <TabsTrigger value="day">Gün</TabsTrigger>
          <TabsTrigger value="week">Hafta</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
