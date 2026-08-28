import { Star, Check, Scissors, Sparkles, MapPin, BadgeCheck } from "lucide-react";

/**
 * Landing hero'sunun imza öğesi: ürünün gerçek arayüzünden sade, fotoğrafsız UI
 * mockup'ları (salon kartı + saat seçici + günlük ajanda). Stok görsel yok.
 * Hepsi tasarım sistemine uyar: shadow-e1/e2, rounded-2xl, aksan yalnızca
 * seçili/birincil öğede.
 */

const PRICE = (n: number) => (
  <span className="font-grotesk text-sm font-semibold">
    {n}
    <span className="font-sans">₺</span>
  </span>
);

/** Müşteriye görünen salon profili kartı. */
export function SalonCardMock() {
  return (
    <div className="w-64 rounded-2xl bg-card p-4 shadow-e2 ring-1 ring-foreground/[0.06]">
      <div className="flex items-center gap-3">
        <div className="font-grotesk flex size-11 items-center justify-center rounded-xl bg-app-accent-soft text-lg font-bold text-app-accent-soft-foreground">
          S
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <p className="font-grotesk truncate font-bold">Studio X</p>
            <BadgeCheck className="size-4 shrink-0 text-app-accent" />
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="size-3.5 fill-app-accent text-app-accent" />
            <span className="font-medium text-foreground">4,9</span>
            <span>· 128</span>
            <span className="inline-flex items-center gap-0.5">
              <MapPin className="size-3" /> Kadıköy
            </span>
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {[
          ["Saç Kesimi", 250],
          ["Sakal Tıraşı", 150],
          ["Fön", 200],
        ].map(([name, price]) => (
          <div
            key={name as string}
            className="flex items-center justify-between rounded-xl px-3 py-2 ring-1 ring-foreground/[0.06]"
          >
            <span className="text-sm">{name}</span>
            {PRICE(price as number)}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Saat seçme adımı — "saniyede randevu" hissini verir. */
export function SlotPickerMock() {
  const slots = ["10:00", "11:30", "13:00", "14:30", "16:00", "17:30"];
  const selected = "13:00";
  return (
    <div className="w-56 rounded-2xl bg-card p-4 shadow-e1 ring-1 ring-foreground/[0.06]">
      <div className="flex items-baseline justify-between">
        <p className="font-grotesk text-sm font-bold">Bugün müsait</p>
        <span className="text-xs text-muted-foreground">12 Nis</span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {slots.map((t) => {
          const on = t === selected;
          return (
            <span
              key={t}
              className={`rounded-lg py-1.5 text-center text-xs font-semibold ${
                on
                  ? "bg-app-accent text-app-accent-foreground"
                  : "text-foreground ring-1 ring-foreground/10"
              }`}
            >
              {t}
            </span>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between rounded-xl bg-app-accent-soft px-3 py-2">
        <span className="text-xs font-medium text-app-accent-soft-foreground">
          {selected} seçildi
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-app-accent px-2.5 py-1 text-xs font-semibold text-app-accent-foreground">
          <Check className="size-3" /> Onayla
        </span>
      </div>
    </div>
  );
}

/** Segment (erkek/kadın) mini göstergesi — her ikisini de görünür kılar. */
export function SegmentChipsMock() {
  return (
    <div className="flex gap-2">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-app-accent px-3 py-1.5 text-xs font-semibold text-app-accent-foreground">
        <Scissors className="size-3.5" /> Erkek
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full text-foreground ring-1 ring-foreground/15 px-3 py-1.5 text-xs font-semibold">
        <Sparkles className="size-3.5" /> Kadın
      </span>
    </div>
  );
}
