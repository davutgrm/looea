"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Ban, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createBlockedSlot } from "@/lib/actions/business";
import { toDateOnlyString } from "@/lib/date";
import { BLOCK_REASON_LABELS } from "@/lib/block-reason";
import type { BlockReason } from "@/generated/prisma/client";

export function BlockedSlotButton({
  staffOptions,
  defaultDate,
}: {
  staffOptions: { id: string; name: string }[];
  defaultDate: Date;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="gap-1.5">
        <Ban className="size-4" /> Bloke Slot
      </Button>
      {open && (
        <BlockedSlotDialog open={open} onOpenChange={setOpen} staffOptions={staffOptions} defaultDate={defaultDate} />
      )}
    </>
  );
}

function BlockedSlotDialog({
  open,
  onOpenChange,
  staffOptions,
  defaultDate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffOptions: { id: string; name: string }[];
  defaultDate: Date;
}) {
  const router = useRouter();
  const [staffId, setStaffId] = useState<string>("ALL");
  const [date, setDate] = useState(toDateOnlyString(defaultDate));
  const [startTime, setStartTime] = useState("13:00");
  const [endTime, setEndTime] = useState("14:00");
  const [reason, setReason] = useState<BlockReason>("LUNCH");
  const [label, setLabel] = useState("");
  const [repeatWeekly, setRepeatWeekly] = useState<"once" | "weekly">("once");
  const [isPending, startTransition] = useTransition();

  function submit() {
    if (startTime >= endTime) {
      toast.error("Bitiş saati başlangıç saatinden sonra olmalı");
      return;
    }
    startTransition(async () => {
      const result = await createBlockedSlot({
        staffId: staffId === "ALL" ? null : staffId,
        date,
        startTime,
        endTime,
        reason,
        label: reason === "CUSTOM" ? label : undefined,
        repeatWeekly: repeatWeekly === "weekly",
      });
      if (result.success) {
        toast.success("Bloke slot eklendi");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bloke Slot Ekle</DialogTitle>
          <DialogDescription>Bu aralık randevuya kapatılır.</DialogDescription>
        </DialogHeader>

        <div className="flex max-h-[65vh] flex-col gap-3 overflow-y-auto pr-1">
          <div className="flex flex-col gap-1.5">
            <Label>Çalışan</Label>
            <Select value={staffId} onValueChange={setStaffId}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tüm çalışanlar</SelectItem>
                {staffOptions.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="block-date">Tarih</Label>
            <Input id="block-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="block-start">Başlangıç</Label>
              <Input id="block-start" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="block-end">Bitiş</Label>
              <Input id="block-end" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Sebep</Label>
            <Select value={reason} onValueChange={(v) => setReason(v as BlockReason)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(BLOCK_REASON_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {reason === "CUSTOM" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="block-label">Açıklama</Label>
              <Input
                id="block-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Örn. Bakım"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label>Tekrar</Label>
            <RadioGroup
              value={repeatWeekly}
              onValueChange={(v) => setRepeatWeekly(v as "once" | "weekly")}
              className="flex gap-4"
            >
              <label className="flex items-center gap-1.5 text-sm">
                <RadioGroupItem value="once" /> Bir kez
              </label>
              <label className="flex items-center gap-1.5 text-sm">
                <RadioGroupItem value="weekly" /> Her hafta
              </label>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="accent" disabled={isPending} onClick={submit}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Bloke Et
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
