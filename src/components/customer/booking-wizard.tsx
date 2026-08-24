"use client";

import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { CalendarDays, ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { fetchAvailability } from "@/lib/actions/availability";
import { createAppointment } from "@/lib/actions/customer";
import { toDateOnlyString } from "@/lib/date";
import { cn } from "@/lib/utils";
import { Price } from "./price";

type Service = {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  category: { name: string };
  staff: { staff: { id: string; name: string; avatarUrl: string | null; title: string | null } }[];
};

type Staff = { id: string; name: string; avatarUrl: string | null; title: string | null };

const STEPS = ["Hizmet", "Tarih & Saat", "Özet"];
const VISIBLE_DAYS = 14;

export function BookingWizard({
  businessId,
  businessName,
  businessLogoUrl,
  businessAddress,
  services,
  initialServiceId,
}: {
  businessId: string;
  businessName: string;
  businessLogoUrl: string | null;
  businessAddress: string | null;
  services: Service[];
  initialServiceId: string | null;
}) {
  const router = useRouter();
  const [step, setStep] = useState(initialServiceId ? 1 : 0);
  const [serviceId, setServiceId] = useState<string | null>(initialServiceId);
  const [staffChoice, setStaffChoice] = useState<string | "any" | null>(initialServiceId ? "any" : null);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string | null>(null);
  const [resolvedStaffId, setResolvedStaffId] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isPending, startTransition] = useTransition();

  const service = services.find((s) => s.id === serviceId) ?? null;
  const eligibleStaff: Staff[] = useMemo(
    () => (service ? service.staff.map((s) => s.staff) : []),
    [service],
  );
  const staffName =
    staffChoice === "any"
      ? eligibleStaff.find((s) => s.id === resolvedStaffId)?.name
      : eligibleStaff.find((s) => s.id === staffChoice)?.name;

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
    if (!serviceId || !staffChoice || !date) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading flag for the async fetch below, standard fetch-on-dependency-change pattern
    setLoadingSlots(true);
    setTime(null);
    const iso = toDateOnlyString(date);
    fetchAvailability({
      businessId,
      serviceId,
      date: iso,
      staffId: staffChoice === "any" ? null : staffChoice,
    }).then(({ merged, perStaff }) => {
      if (staffChoice === "any") {
        setSlots(merged.map((m) => m.time));
      } else {
        setSlots(perStaff[0]?.slots ?? []);
      }
      setLoadingSlots(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId, staffChoice, date]);

  function selectService(s: Service) {
    setServiceId(s.id);
    setStaffChoice("any");
    setResolvedStaffId(null);
  }

  function pickTime(t: string) {
    setTime(t);
    if (staffChoice === "any") {
      fetchAvailability({ businessId, serviceId: serviceId!, date: toDateOnlyString(date!), staffId: null }).then(
        ({ merged }) => {
          setResolvedStaffId(merged.find((m) => m.time === t)?.staffId ?? null);
        },
      );
    } else {
      setResolvedStaffId(staffChoice);
    }
    setStep(2);
  }

  function confirm() {
    if (!serviceId || !date || !time) return;
    startTransition(async () => {
      const res = await createAppointment({
        businessId,
        serviceId,
        staffId: staffChoice === "any" ? null : staffChoice,
        date: toDateOnlyString(date),
        time,
      });
      if (res.success) {
        toast.success("Randevunuz oluşturuldu!");
        router.push("/hesabim/randevularim");
      } else {
        toast.error(res.error);
      }
    });
  }

  const dateLabel = date
    ? date.toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long" })
    : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold">{businessName} için randevu al</h1>
        <p className="mt-1 text-sm text-muted-foreground">Birkaç adımda randevunu tamamla</p>
      </div>

      {/* Stepper */}
      <div className="mb-6 flex max-w-lg items-center gap-1">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-1">
            <div
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                i <= step ? "bg-app-accent" : "bg-muted",
              )}
            />
          </div>
        ))}
      </div>

      {step > 0 && (
        <button
          onClick={() => setStep((s) => s - 1)}
          className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" /> Geri
        </button>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="max-w-lg">
          {/* Step 0: service (+ inline staff) */}
          {step === 0 && (
            <div>
              <h2 className="text-lg font-bold">Hizmet seç</h2>
              <div className="mt-3 space-y-2">
                {services.map((s) => (
                  <div key={s.id}>
                    <button
                      onClick={() => selectService(s)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-2xl border bg-card p-4 text-left shadow-sm transition-colors hover:border-app-accent",
                        serviceId === s.id && "border-app-accent bg-app-accent-soft",
                      )}
                    >
                      <div>
                        <p className="font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {s.category.name} · {s.durationMinutes} dk
                        </p>
                      </div>
                      <p className="font-semibold"><Price amount={s.price} /></p>
                    </button>

                    {serviceId === s.id && eligibleStaff.length > 1 && (
                      <div className="mt-2 flex flex-wrap gap-2 pl-1">
                        <button
                          onClick={() => setStaffChoice("any")}
                          className={cn(
                            "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                            staffChoice === "any"
                              ? "border-app-accent bg-app-accent text-app-accent-foreground"
                              : "text-muted-foreground hover:border-app-accent",
                          )}
                        >
                          Farketmez
                        </button>
                        {eligibleStaff.map((st) => (
                          <button
                            key={st.id}
                            onClick={() => setStaffChoice(st.id)}
                            className={cn(
                              "flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-3 text-xs font-medium transition-colors",
                              staffChoice === st.id
                                ? "border-app-accent bg-app-accent text-app-accent-foreground"
                                : "text-muted-foreground hover:border-app-accent",
                            )}
                          >
                            <Avatar className="size-5">
                              <AvatarImage src={st.avatarUrl ?? undefined} />
                              <AvatarFallback className="text-[9px]">{st.name[0]}</AvatarFallback>
                            </Avatar>
                            {st.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Button
                variant="accent"
                className="mt-6 w-full"
                disabled={!serviceId}
                onClick={() => setStep(1)}
              >
                Devam Et
              </Button>
            </div>
          )}

          {/* Step 1: date & time */}
          {step === 1 && service && (
            <div>
              <h2 className="text-lg font-bold">Tarih & saat seç</h2>
              <p className="mt-1 text-sm text-muted-foreground">{service.durationMinutes} dk&apos;lık slot seç</p>

              <div className="mt-4 flex items-center gap-2">
                <div className="flex flex-1 gap-2 overflow-x-auto pb-1">
                  {days.map((d) => {
                    const active = date && toDateOnlyString(date) === toDateOnlyString(d);
                    return (
                      <button
                        key={d.toISOString()}
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
                    <Button variant="outline" size="icon" aria-label="Takvimde seç">
                      <CalendarDays className="size-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={setDate} disabled={{ before: new Date() }} />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="mt-5">
                {!date ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">Devam etmek için bir tarih seç.</p>
                ) : loadingSlots ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="size-6 animate-spin text-app-accent" />
                  </div>
                ) : slots.length === 0 ? (
                  <p className="py-10 text-center text-sm text-muted-foreground">
                    Bu tarih için müsait saat yok, başka bir tarih seç.
                  </p>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {slots.map((t) => (
                      <button
                        key={t}
                        onClick={() => pickTime(t)}
                        className={cn(
                          "rounded-xl border py-2 text-sm font-medium transition-colors hover:border-app-accent",
                          time === t && "border-app-accent bg-app-accent-soft text-app-accent-soft-foreground",
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

          {/* Step 2: summary */}
          {step === 2 && service && date && time && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold">Özet</h2>
              <div className="space-y-3 rounded-2xl border bg-card p-5 shadow-sm">
                <Row label="İşletme" value={businessName} />
                <Row label="Hizmet" value={service.name} onEdit={() => setStep(0)} />
                {staffName && <Row label="Çalışan" value={staffName} />}
                <Row label="Tarih · Saat" value={`${dateLabel} · ${time}`} onEdit={() => setStep(1)} />
                {businessAddress && <Row label="Adres" value={businessAddress} />}
                <Row label="Süre" value={`${service.durationMinutes} dk`} />
                <div className="border-t pt-3">
                  <Row label="Toplam" value={<Price amount={service.price} />} bold />
                </div>
              </div>
              <Button variant="accent" className="w-full" size="lg" disabled={isPending} onClick={confirm}>
                {isPending && <Loader2 className="size-4 animate-spin" />}
                Randevuyu Onayla
              </Button>
            </div>
          )}
        </div>

        {/* Sticky summary */}
        <aside className="hidden lg:block">
          <div className="sticky top-6 rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-muted">
                {businessLogoUrl && <Image src={businessLogoUrl} alt={businessName} fill className="object-cover" />}
              </div>
              <p className="font-semibold">{businessName}</p>
            </div>

            <div className="mt-4 space-y-3 border-t pt-4 text-sm">
              <SummaryRow label="Hizmet" value={service ? `${service.name} · ${service.durationMinutes} dk` : null} />
              <SummaryRow label="Tarih & Saat" value={date && time ? `${toDateOnlyString(date)} · ${time}` : date ? toDateOnlyString(date) : null} />
              <div className="flex items-center justify-between border-t pt-3 font-semibold">
                <span>Toplam</span>
                <span>{service ? <Price amount={service.price} /> : "—"}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, bold, onEdit }: { label: string; value: ReactNode; bold?: boolean; onEdit?: () => void }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2 text-right">
        <span className={bold ? "text-base font-semibold" : "font-medium"}>{value}</span>
        {onEdit && (
          <button onClick={onEdit} className="shrink-0 text-xs font-medium text-app-accent hover:underline">
            Değiştir
          </button>
        )}
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("text-right font-medium", !value && "text-muted-foreground")}>{value ?? "—"}</span>
    </div>
  );
}
