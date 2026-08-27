"use client";

import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Search, ChevronLeft, Loader2, CalendarDays } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toDateOnlyString } from "@/lib/date";
import { Price } from "@/components/business/price";
import { upsertBusinessCustomer, createManualAppointment } from "@/lib/actions/business";
import { fetchAvailabilityForServices } from "@/lib/actions/availability";
import type { ManualBookingCustomer, ManualBookingService } from "@/lib/data/business-panel";

const STEPS = ["Müşteri", "Hizmetler", "Çalışan", "Tarih & Saat", "Özet"];
const VISIBLE_DAYS = 14;

export function ManualAppointmentButton({
  businessId,
  customers,
  services,
  staffOptions,
}: {
  businessId: string;
  customers: ManualBookingCustomer[];
  services: ManualBookingService[];
  staffOptions: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="accent" onClick={() => setOpen(true)} className="gap-1.5">
        <Plus className="size-4" /> Randevu Ekle
      </Button>
      {open && (
        <ManualAppointmentDialog
          open={open}
          onOpenChange={setOpen}
          businessId={businessId}
          customers={customers}
          services={services}
          staffOptions={staffOptions}
        />
      )}
    </>
  );
}

function ManualAppointmentDialog({
  open,
  onOpenChange,
  businessId,
  customers,
  services,
  staffOptions,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId: string;
  customers: ManualBookingCustomer[];
  services: ManualBookingService[];
  staffOptions: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [localCustomers, setLocalCustomers] = useState(customers);
  const [customerQuery, setCustomerQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<ManualBookingCustomer | null>(null);
  const [showWalkInForm, setShowWalkInForm] = useState(false);
  const [walkInName, setWalkInName] = useState("");
  const [walkInPhone, setWalkInPhone] = useState("");

  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [staffChoice, setStaffChoice] = useState<string | "any" | null>(null);
  const [resolvedStaffId, setResolvedStaffId] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [notes, setNotes] = useState("");

  const [isPending, startTransition] = useTransition();
  const [isCreatingCustomer, startCreatingCustomer] = useTransition();

  const filteredCustomers = useMemo(() => {
    const q = customerQuery.trim().toLowerCase();
    if (!q) return localCustomers.slice(0, 8);
    return localCustomers
      .filter((c) => c.name.toLowerCase().includes(q) || (c.phone ?? "").includes(q))
      .slice(0, 8);
  }, [localCustomers, customerQuery]);

  const selectedServices = useMemo(
    () => selectedServiceIds.map((id) => services.find((s) => s.id === id)!).filter(Boolean),
    [selectedServiceIds, services],
  );
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);

  const eligibleStaff = useMemo(() => {
    if (selectedServices.length === 0) return [];
    const staffIdSets = selectedServices.map((s) => new Set(s.staffIds));
    return staffOptions.filter((staff) => staffIdSets.every((set) => set.has(staff.id)));
  }, [selectedServices, staffOptions]);

  const days = useMemo(() => {
    const arr: Date[] = [];
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    for (let i = 0; i < VISIBLE_DAYS; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, []);

  useEffect(() => {
    if (!staffChoice || !date || selectedServiceIds.length === 0) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading flag for the async fetch below
    setLoadingSlots(true);
    setTime(null);
    fetchAvailabilityForServices({
      businessId,
      serviceIds: selectedServiceIds,
      date: toDateOnlyString(date),
      staffId: staffChoice === "any" ? null : staffChoice,
    }).then(({ merged, perStaff }) => {
      if (staffChoice === "any") {
        setSlots(merged.map((m) => m.time));
      } else {
        setSlots(perStaff[0]?.slots ?? []);
      }
      setLoadingSlots(false);
    });
  }, [staffChoice, date, selectedServiceIds, businessId]);

  function toggleService(id: string) {
    const next = selectedServiceIds.includes(id)
      ? selectedServiceIds.filter((s) => s !== id)
      : [...selectedServiceIds, id];
    setSelectedServiceIds(next);

    if (staffChoice && staffChoice !== "any") {
      const nextServices = next.map((sid) => services.find((s) => s.id === sid)).filter((s) => !!s);
      const stillEligible =
        nextServices.length > 0 && nextServices.every((s) => s.staffIds.includes(staffChoice));
      if (!stillEligible) setStaffChoice(null);
    }
  }

  function pickTime(t: string) {
    setTime(t);
    if (staffChoice === "any") {
      fetchAvailabilityForServices({
        businessId,
        serviceIds: selectedServiceIds,
        date: toDateOnlyString(date!),
        staffId: null,
      }).then(({ merged }) => {
        setResolvedStaffId(merged.find((m) => m.time === t)?.staffId ?? null);
      });
    } else {
      setResolvedStaffId(staffChoice);
    }
    setStep(4);
  }

  function createWalkIn() {
    if (!walkInPhone.trim()) {
      toast.error("Telefon numarası gerekli");
      return;
    }
    startCreatingCustomer(async () => {
      const result = await upsertBusinessCustomer({ name: walkInName, phone: walkInPhone });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      const customer: ManualBookingCustomer = {
        kind: "business",
        id: result.data.id,
        name: result.data.name ?? "İsimsiz müşteri",
        phone: result.data.phone,
      };
      setLocalCustomers((prev) => [customer, ...prev.filter((c) => c.id !== customer.id)]);
      setSelectedCustomer(customer);
      setShowWalkInForm(false);
      setStep(1);
    });
  }

  function confirm() {
    if (!selectedCustomer || !date || !time || selectedServiceIds.length === 0) return;
    startTransition(async () => {
      const result = await createManualAppointment({
        customerId: selectedCustomer.kind === "user" ? selectedCustomer.id : undefined,
        businessCustomerId: selectedCustomer.kind === "business" ? selectedCustomer.id : undefined,
        serviceIds: selectedServiceIds,
        staffId: staffChoice === "any" ? null : staffChoice,
        date: toDateOnlyString(date),
        time,
        notes,
      });
      if (result.success) {
        toast.success("Randevu oluşturuldu");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  const staffName =
    staffChoice === "any"
      ? staffOptions.find((s) => s.id === resolvedStaffId)?.name
      : staffOptions.find((s) => s.id === staffChoice)?.name;
  const dateLabel = date
    ? date.toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long" })
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Yeni Randevu</DialogTitle>
          <DialogDescription>{STEPS[step]}</DialogDescription>
        </DialogHeader>

        <div className="mb-1 flex items-center gap-1">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={cn("h-1.5 flex-1 rounded-full transition-colors", i <= step ? "bg-app-accent" : "bg-muted")}
            />
          ))}
        </div>

        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-4" /> Geri
          </button>
        )}

        <div className="flex-1 overflow-y-auto pr-1">
          {step === 0 && (
            <div className="flex flex-col gap-3">
              {!showWalkInForm ? (
                <>
                  <div className="relative">
                    <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="İsim veya telefon ile ara"
                      value={customerQuery}
                      onChange={(e) => setCustomerQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <div className="flex max-h-64 flex-col gap-1.5 overflow-y-auto">
                    {filteredCustomers.length === 0 ? (
                      <p className="py-4 text-center text-sm text-muted-foreground">Müşteri bulunamadı.</p>
                    ) : (
                      filteredCustomers.map((c) => (
                        <button
                          key={`${c.kind}-${c.id}`}
                          type="button"
                          onClick={() => {
                            setSelectedCustomer(c);
                            setStep(1);
                          }}
                          className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5 text-left transition-colors hover:border-app-accent"
                        >
                          <span className="text-sm font-medium">{c.name}</span>
                          <span className="text-xs text-muted-foreground">{c.phone ?? "—"}</span>
                        </button>
                      ))
                    )}
                  </div>
                  <Button type="button" variant="outline" onClick={() => setShowWalkInForm(true)}>
                    + Geçici Müşteri
                  </Button>
                </>
              ) : (
                <div className="flex flex-col gap-3 rounded-xl border border-border p-3.5">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="walkin-name">İsim (opsiyonel)</Label>
                    <Input
                      id="walkin-name"
                      value={walkInName}
                      onChange={(e) => setWalkInName(e.target.value)}
                      placeholder="Müşteri adı"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="walkin-phone">Telefon</Label>
                    <div className="flex items-center gap-2">
                      <span className="shrink-0 rounded-lg border border-border px-2.5 py-2 text-sm text-muted-foreground">
                        +90
                      </span>
                      <Input
                        id="walkin-phone"
                        value={walkInPhone}
                        onChange={(e) => setWalkInPhone(e.target.value)}
                        placeholder="5xx xxx xx xx"
                        inputMode="tel"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowWalkInForm(false)}>
                      Vazgeç
                    </Button>
                    <Button
                      type="button"
                      variant="accent"
                      className="flex-1"
                      disabled={isCreatingCustomer}
                      onClick={createWalkIn}
                    >
                      {isCreatingCustomer && <Loader2 className="size-4 animate-spin" />}
                      Ekle ve Devam Et
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-3">
              {services.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Önce Hizmetler sayfasından hizmet ekleyin.
                </p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {services.map((s) => (
                    <label
                      key={s.id}
                      className={cn(
                        "flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-border px-3 py-2.5 transition-colors",
                        selectedServiceIds.includes(s.id) && "border-app-accent bg-app-accent-soft",
                      )}
                    >
                      <span className="flex items-center gap-2.5">
                        <Checkbox
                          checked={selectedServiceIds.includes(s.id)}
                          onCheckedChange={() => toggleService(s.id)}
                        />
                        <span className="flex flex-col">
                          <span className="text-sm font-medium">{s.name}</span>
                          <span className="text-xs text-muted-foreground">{s.durationMinutes} dk</span>
                        </span>
                      </span>
                      <span className="text-sm font-semibold">
                        <Price amount={s.price} />
                      </span>
                    </label>
                  ))}
                </div>
              )}
              {selectedServices.length > 0 && (
                <div className="flex items-center justify-between rounded-xl bg-muted px-3.5 py-2.5 text-sm">
                  <span className="text-muted-foreground">
                    Toplam · {totalDuration} dk
                  </span>
                  <span className="font-semibold">
                    <Price amount={totalPrice} />
                  </span>
                </div>
              )}
              <Button
                type="button"
                variant="accent"
                disabled={selectedServiceIds.length === 0}
                onClick={() => setStep(2)}
              >
                Devam Et
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-3">
              {eligibleStaff.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Seçilen hizmetlerin tümünü verebilecek aktif çalışan yok.
                </p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => setStaffChoice("any")}
                    className={cn(
                      "rounded-xl border border-border px-3.5 py-2.5 text-left text-sm font-medium transition-colors",
                      staffChoice === "any" && "border-app-accent bg-app-accent-soft",
                    )}
                  >
                    Farketmez
                  </button>
                  {eligibleStaff.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStaffChoice(s.id)}
                      className={cn(
                        "rounded-xl border border-border px-3.5 py-2.5 text-left text-sm font-medium transition-colors",
                        staffChoice === s.id && "border-app-accent bg-app-accent-soft",
                      )}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
              <Button type="button" variant="accent" disabled={!staffChoice} onClick={() => setStep(3)}>
                Devam Et
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="flex flex-1 gap-2 overflow-x-auto pb-1">
                  {days.map((d) => {
                    const active = date && toDateOnlyString(date) === toDateOnlyString(d);
                    return (
                      <button
                        key={d.toISOString()}
                        type="button"
                        onClick={() => setDate(d)}
                        className={cn(
                          "flex shrink-0 flex-col items-center gap-0.5 rounded-2xl border px-3 py-2 transition-colors",
                          active
                            ? "border-app-accent bg-app-accent text-app-accent-foreground"
                            : "hover:border-app-accent",
                        )}
                      >
                        <span className="text-[10px] font-medium uppercase opacity-80">
                          {d.toLocaleDateString("tr-TR", { weekday: "short" })}
                        </span>
                        <span className="text-sm font-bold">
                          {d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" size="icon" aria-label="Takvimde seç">
                      <CalendarDays className="size-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={setDate} disabled={{ before: new Date() }} />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="mt-1">
                {!date ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">Devam etmek için bir tarih seç.</p>
                ) : loadingSlots ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="size-6 animate-spin text-app-accent" />
                  </div>
                ) : slots.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    Bu tarihte müsait saat yok, başka bir tarih seç.
                  </p>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {slots.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => pickTime(t)}
                        className={cn(
                          "rounded-xl border py-2 text-sm font-medium transition-colors hover:border-app-accent",
                          time === t && "border-app-accent bg-app-accent-soft",
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 4 && selectedCustomer && date && time && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2.5 rounded-2xl border border-border p-4">
                <SummaryRow label="Müşteri" value={selectedCustomer.name} />
                <SummaryRow label="Hizmetler" value={selectedServices.map((s) => s.name).join(", ")} />
                <SummaryRow label="Süre" value={`${totalDuration} dk`} />
                {staffName && <SummaryRow label="Çalışan" value={staffName} />}
                <SummaryRow label="Tarih · Saat" value={`${dateLabel} · ${time}`} />
                <div className="border-t border-border pt-2.5">
                  <SummaryRow label="Toplam" value={<Price amount={totalPrice} />} bold />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="manual-notes">Not (opsiyonel)</Label>
                <Textarea id="manual-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
              </div>
              <Button type="button" variant="accent" size="lg" disabled={isPending} onClick={confirm}>
                {isPending && <Loader2 className="size-4 animate-spin" />}
                Randevuyu Onayla
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: ReactNode; bold?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className={cn("text-right", bold ? "text-base font-semibold" : "font-medium")}>{value}</span>
    </div>
  );
}
