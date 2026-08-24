"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addStaffTimeOff, deleteStaffTimeOff } from "@/lib/actions/business";

export type TimeOffRow = { id: string; startDate: string; endDate: string; reason: string | null };

export function StaffTimeOffSheet({
  open,
  onOpenChange,
  staffId,
  staffName,
  timeOff,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffId: string;
  staffName: string;
  timeOff: TimeOffRow[];
}) {
  const router = useRouter();
  // This component is only mounted while its Sheet is open (the parent
  // conditionally renders it), so the form always starts blank on a fresh
  // mount — no reset-on-open effect needed.
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    if (!startDate || !endDate) {
      toast.error("Başlangıç ve bitiş tarihi gerekli");
      return;
    }
    startTransition(async () => {
      const result = await addStaffTimeOff({ staffId, startDate, endDate, reason });
      if (result.success) {
        toast.success("İzin eklendi");
        setStartDate("");
        setEndDate("");
        setReason("");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteStaffTimeOff(id);
      if (result.success) {
        toast.success("İzin silindi");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>İzin Günleri — {staffName}</SheetTitle>
          <SheetDescription>Çalışanın izinli/kapalı olduğu tarih aralıklarını yönetin.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 pb-4">
          <div className="flex flex-col gap-2.5 rounded-lg border border-border p-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="timeoff-start">Başlangıç</Label>
                <Input id="timeoff-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="timeoff-end">Bitiş</Label>
                <Input id="timeoff-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="timeoff-reason">Sebep (opsiyonel)</Label>
              <Input
                id="timeoff-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Yıllık izin, rapor..."
              />
            </div>
            <Button type="button" variant="accent" onClick={handleAdd} disabled={isPending} className="mt-1 w-full">
              İzin Ekle
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            {timeOff.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Planlı izin bulunmuyor.</p>
            ) : (
              timeOff.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-2 rounded-lg border border-border p-2.5">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {format(new Date(t.startDate), "d MMM yyyy", { locale: tr })} —{" "}
                      {format(new Date(t.endDate), "d MMM yyyy", { locale: tr })}
                    </span>
                    {t.reason ? <span className="text-xs text-muted-foreground">{t.reason}</span> : null}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={isPending}
                    onClick={() => handleDelete(t.id)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
