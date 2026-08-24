"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setStaffSchedule } from "@/lib/actions/business";

export type ScheduleBlock = { dayOfWeek: number; startTime: string; endTime: string };
type EditableBlock = ScheduleBlock & { key: string };

const DAYS = [
  { value: 1, label: "Pazartesi" },
  { value: 2, label: "Salı" },
  { value: 3, label: "Çarşamba" },
  { value: 4, label: "Perşembe" },
  { value: 5, label: "Cuma" },
  { value: 6, label: "Cumartesi" },
  { value: 0, label: "Pazar" },
];

let keySeq = 0;
function nextKey() {
  keySeq += 1;
  return `blk-${keySeq}`;
}

export function StaffScheduleSheet({
  open,
  onOpenChange,
  staffId,
  staffName,
  initialSchedule,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffId: string;
  staffName: string;
  initialSchedule: ScheduleBlock[];
}) {
  const router = useRouter();
  // This component is only mounted while its Sheet is open (the parent
  // conditionally renders it), so a fresh mount always means a fresh staff
  // selection — lazy-init from props instead of syncing via an effect.
  const [blocks, setBlocks] = useState<EditableBlock[]>(() =>
    initialSchedule.map((b) => ({ ...b, key: nextKey() })),
  );
  const [saving, setSaving] = useState(false);

  function addBlock(dayOfWeek: number) {
    setBlocks((prev) => [...prev, { key: nextKey(), dayOfWeek, startTime: "09:00", endTime: "18:00" }]);
  }

  function removeBlock(key: string) {
    setBlocks((prev) => prev.filter((b) => b.key !== key));
  }

  function updateBlock(key: string, field: "startTime" | "endTime", value: string) {
    setBlocks((prev) => prev.map((b) => (b.key === key ? { ...b, [field]: value } : b)));
  }

  async function handleSave() {
    setSaving(true);
    const result = await setStaffSchedule(
      staffId,
      blocks.map(({ dayOfWeek, startTime, endTime }) => ({ dayOfWeek, startTime, endTime })),
    );
    setSaving(false);
    if (result.success) {
      toast.success("Çalışma saatleri kaydedildi");
      router.refresh();
      onOpenChange(false);
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Çalışma Saatleri — {staffName}</SheetTitle>
          <SheetDescription>
            Her gün için birden fazla çalışma bloğu ekleyebilirsiniz (öğle arası için iki blok kullanın).
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 pb-4">
          {DAYS.map((day) => {
            const dayBlocks = blocks.filter((b) => b.dayOfWeek === day.value);
            return (
              <div key={day.value} className="flex flex-col gap-2 rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{day.label}</span>
                  <Button type="button" variant="ghost" size="icon-sm" onClick={() => addBlock(day.value)}>
                    <Plus className="size-4" />
                  </Button>
                </div>
                {dayBlocks.length === 0 ? (
                  <span className="text-xs text-muted-foreground">Kapalı</span>
                ) : (
                  <div className="flex flex-col gap-2">
                    {dayBlocks.map((b) => (
                      <div key={b.key} className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={b.startTime}
                          onChange={(e) => updateBlock(b.key, "startTime", e.target.value)}
                          className="w-full"
                        />
                        <span className="text-xs text-muted-foreground">—</span>
                        <Input
                          type="time"
                          value={b.endTime}
                          onChange={(e) => updateBlock(b.key, "endTime", e.target.value)}
                          className="w-full"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => removeBlock(b.key)}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <SheetFooter>
          <Button variant="accent" onClick={handleSave} disabled={saving}>
            Kaydet
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
