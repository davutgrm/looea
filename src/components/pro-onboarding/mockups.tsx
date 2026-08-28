import { Check, Star, TrendingUp } from "lucide-react";

/**
 * Tanıtım ekranlarındaki görseller: ürünün kendi arayüzünden sade UI mockup'ları
 * (illüstrasyon/fotoğraf değil). Hepsi düz renk, tek aksan (#A21CDB) minimum.
 */

const cardBase =
  "w-full max-w-sm rounded-[22px] border border-black/[0.07] bg-card p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_20px_40px_-24px_rgba(0,0,0,0.22)] dark:border-white/10";

/** Günlük takvim kartı. */
export function MockCalendarCard() {
  const slots = [
    { time: "09:30", name: "Ahmet Y.", service: "Saç & sakal", filled: true },
    { time: "11:00", name: "Boş", service: "", filled: false },
    { time: "13:30", name: "Elif K.", service: "Fön", filled: true },
    { time: "15:00", name: "Merve T.", service: "Kesim + boya", filled: true },
  ];
  return (
    <div className={cardBase}>
      <div className="flex items-baseline justify-between">
        <p className="font-grotesk text-sm font-bold">Bugün</p>
        <p className="text-xs text-muted-foreground">12 Nisan, Salı</p>
      </div>
      <div className="mt-4 space-y-2">
        {slots.map((s) => (
          <div
            key={s.time}
            className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
              s.filled ? "border-app-accent/25 bg-app-accent-soft/50" : "border-dashed border-black/10 dark:border-white/15"
            }`}
          >
            <span className="font-grotesk w-11 shrink-0 text-xs font-semibold text-muted-foreground">{s.time}</span>
            {s.filled ? (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{s.name}</p>
                <p className="truncate text-xs text-muted-foreground">{s.service}</p>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">Boş</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Müşteriye görünen işletme profili kartı. */
export function MockProfileCard() {
  return (
    <div className={cardBase}>
      <div className="flex items-center gap-3">
        <div className="font-grotesk flex size-12 items-center justify-center rounded-2xl bg-app-accent-soft text-lg font-bold text-app-accent-soft-foreground">
          S
        </div>
        <div className="min-w-0">
          <p className="truncate font-grotesk font-bold">Studio X</p>
          <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="size-3.5 fill-app-accent text-app-accent" />
            <span className="font-medium text-foreground">4,9</span>
            <span>· Kadıköy, İstanbul</span>
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {["Saç Kesimi", "Sakal Tıraşı", "Fön"].map((svc, i) => (
          <div key={svc} className="flex items-center justify-between rounded-xl border border-black/[0.07] px-3 py-2 dark:border-white/10">
            <span className="text-sm">{svc}</span>
            <span className="font-grotesk text-sm font-semibold">{[250, 150, 200][i]}<span className="font-sans">₺</span></span>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-full bg-black py-2.5 text-center text-sm font-semibold text-white dark:bg-white dark:text-black">
        Randevu Al
      </div>
    </div>
  );
}

/** Aylık özet / istatistik kartı. */
export function MockStatsCard() {
  const stats = [
    { label: "Randevu", value: "128" },
    { label: "Yeni müşteri", value: "34" },
    { label: "Doluluk", value: "%82" },
  ];
  const services = [
    { name: "Saç Kesimi", pct: 90 },
    { name: "Sakal", pct: 62 },
    { name: "Boya", pct: 40 },
  ];
  return (
    <div className={cardBase}>
      <div className="flex items-center justify-between">
        <p className="font-grotesk text-sm font-bold">Bu ay</p>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-app-accent">
          <TrendingUp className="size-3.5" /> +%18
        </span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-black/[0.07] p-3 dark:border-white/10">
            <p className="font-grotesk text-xl font-bold tracking-tight">{s.value}</p>
            <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-2.5">
        {services.map((svc) => (
          <div key={svc.name} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{svc.name}</span>
              <Check className="size-3 text-app-accent" />
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-app-accent" style={{ width: `${svc.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
