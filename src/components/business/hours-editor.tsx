"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { updateBusinessHours } from "@/lib/actions/business";

export type HoursRow = { dayOfWeek: number; openTime: string | null; closeTime: string | null; isClosed: boolean };

const DAYS = [
  { value: 1, label: "Pazartesi" },
  { value: 2, label: "Salı" },
  { value: 3, label: "Çarşamba" },
  { value: 4, label: "Perşembe" },
  { value: 5, label: "Cuma" },
  { value: 6, label: "Cumartesi" },
  { value: 0, label: "Pazar" },
];

export function HoursEditor({ initialHours }: { initialHours: HoursRow[] }) {
  const router = useRouter();
  const [hours, setHours] = useState<HoursRow[]>(initialHours);
  const [isPending, startTransition] = useTransition();

  function getDay(dayOfWeek: number): HoursRow {
    return hours.find((h) => h.dayOfWeek === dayOfWeek) ?? { dayOfWeek, openTime: "09:00", closeTime: "19:00", isClosed: false };
  }

  function updateDay(dayOfWeek: number, patch: Partial<HoursRow>) {
    setHours((prev) => {
      const existing = prev.find((h) => h.dayOfWeek === dayOfWeek);
      if (existing) {
        return prev.map((h) => (h.dayOfWeek === dayOfWeek ? { ...h, ...patch } : h));
      }
      return [...prev, { ...getDay(dayOfWeek), ...patch }];
    });
  }

  function handleSave() {
    startTransition(async () => {
      const payload = DAYS.map((d) => getDay(d.value));
      const result = await updateBusinessHours(payload);
      if (result.success) {
        toast.success("Çalışma saatleri güncellendi");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Çalışma Saatleri</CardTitle>
        <CardDescription>Haftalık açılış ve kapanış saatlerinizi belirleyin.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5">
        {DAYS.map((day) => {
          const row = getDay(day.value);
          return (
            <div
              key={day.value}
              className="flex flex-col gap-2 rounded-lg border border-border p-2.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="flex w-28 shrink-0 items-center gap-2 text-sm font-medium">
                <span className={`size-1.5 shrink-0 rounded-full ${row.isClosed ? "bg-destructive" : "bg-emerald-500"}`} />
                {day.label}
              </span>
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={row.openTime ?? ""}
                  disabled={row.isClosed}
                  onChange={(e) => updateDay(day.value, { openTime: e.target.value })}
                  className="w-32"
                />
                <span className="text-xs text-muted-foreground">—</span>
                <Input
                  type="time"
                  value={row.closeTime ?? ""}
                  disabled={row.isClosed}
                  onChange={(e) => updateDay(day.value, { closeTime: e.target.value })}
                  className="w-32"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Kapalı</span>
                <Switch
                  checked={row.isClosed}
                  onCheckedChange={(v) => updateDay(day.value, { isClosed: v })}
                  className="data-checked:bg-destructive"
                />
              </div>
            </div>
          );
        })}
      </CardContent>
      <CardFooter>
        <Button type="button" variant="accent" onClick={handleSave} disabled={isPending}>
          Kaydet
        </Button>
      </CardFooter>
    </Card>
  );
}
