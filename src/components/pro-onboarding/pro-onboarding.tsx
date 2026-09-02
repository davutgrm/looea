"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowRight,
  ArrowLeft,
  Loader2,
  Check,
  Scissors,
  Sparkles,
  Users,
  Flower2,
  Gem,
  Brush,
  Store,
  CalendarCheck,
  LayoutGrid,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { spaceGrotesk } from "@/lib/fonts";
import { TR_PROVINCES } from "@/lib/turkey-locations";
import { BUSINESS_KIND_OPTIONS, REFERRAL_SOURCE_OPTIONS } from "@/lib/business-types";
import { registerBusiness } from "@/lib/actions/auth";
import type { BusinessType } from "@/generated/prisma/client";
import type { LatLng } from "@/lib/maps/types";
import { btn } from "@/lib/design-tokens";
import { MockCalendarCard, MockProfileCard, MockStatsCard } from "./mockups";

const LocationPicker = dynamic(
  () => import("./location-picker").then((m) => m.LocationPicker),
  {
    ssr: false,
    loading: () => <div className="h-72 w-full animate-pulse rounded-2xl bg-muted" />,
  },
);

const KIND_ICONS: Record<BusinessType, LucideIcon> = {
  MEN_BARBER: Scissors,
  WOMEN_SALON: Sparkles,
  UNISEX_SALON: Users,
  BEAUTY_SALON: Flower2,
  NAIL_SALON: Gem,
  MAKEUP_STUDIO: Brush,
  OTHER: Store,
};

// Büyük şehirler için yaklaşık merkez; harita pin'i buraya iner, kullanıcı sürükler.
const CITY_CENTERS: Record<string, LatLng> = {
  İstanbul: { lat: 41.0082, lng: 28.9784 },
  Ankara: { lat: 39.9334, lng: 32.8597 },
  İzmir: { lat: 38.4237, lng: 27.1428 },
  Bursa: { lat: 40.1826, lng: 29.0665 },
  Antalya: { lat: 36.8969, lng: 30.7133 },
  Adana: { lat: 37.0, lng: 35.3213 },
  Konya: { lat: 37.8746, lng: 32.4932 },
  Gaziantep: { lat: 37.0662, lng: 37.3833 },
  Kayseri: { lat: 38.7312, lng: 35.4787 },
  Mersin: { lat: 36.8121, lng: 34.6415 },
  Eskişehir: { lat: 39.7767, lng: 30.5206 },
  Samsun: { lat: 41.2867, lng: 36.33 },
  Diyarbakır: { lat: 37.9144, lng: 40.2306 },
  Trabzon: { lat: 41.0027, lng: 39.7168 },
};
const DEFAULT_CENTER: LatLng = CITY_CENTERS.İstanbul;

const INTRO = [
  {
    icon: CalendarCheck,
    title: "Takvimini otomatik doldur",
    desc: "Müşterilerin 7/24 online randevu alsın, telefon ve DM trafiği bitsin. Randevular takvimine kendiliğinden düşsün.",
    mock: <MockCalendarCard />,
  },
  {
    icon: LayoutGrid,
    title: "Tek panelden yönet",
    desc: "Hizmetler, çalışanlar, çalışma saatleri ve müşterilerin — hepsi tek yerde. Salonunu masaüstünden ya da telefonundan yönet.",
    mock: <MockStatsCard />,
  },
  {
    icon: TrendingUp,
    title: "Yeni müşteriler kazan",
    desc: "İşletmen Looea'da görünür olsun; doğrulanmış yorumlarla güven kazan, yeni müşteriler sana gelsin.",
    mock: <MockProfileCard />,
  },
];

// Akış: 3 tanıtım + 7 soru adımı, sonra başarı ekranı.
const STEPS = [
  "intro-0",
  "intro-1",
  "intro-2",
  "name",
  "kind",
  "place",
  "address",
  "owner",
  "account",
  "referral",
] as const;
type StepId = (typeof STEPS)[number];

const FIRST_FORM_INDEX = STEPS.indexOf("name");

type FormState = {
  businessName: string;
  businessType: BusinessType | null;
  city: string;
  district: string;
  address: string;
  coords: LatLng | null;
  ownerName: string;
  ownerPhone: string;
  email: string;
  password: string;
  referralSource: string;
};

const INITIAL: FormState = {
  businessName: "",
  businessType: null,
  city: "",
  district: "",
  address: "",
  coords: null,
  ownerName: "",
  ownerPhone: "",
  email: "",
  password: "",
  referralSource: "",
};

const inputClass = "focus-visible:border-app-accent focus-visible:ring-app-accent/50";

export function ProOnboarding() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [isPending, startTransition] = useTransition();

  const step: StepId = STEPS[index];
  const isIntro = step.startsWith("intro");
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const districts = useMemo(
    () => TR_PROVINCES.find((p) => p.name === form.city)?.districts ?? [],
    [form.city],
  );
  const cityCenter = CITY_CENTERS[form.city] ?? DEFAULT_CENTER;

  // Genel ilerleme: son form adımı ~ tam dolu.
  const progress = done ? 1 : index / (STEPS.length - 1);

  const canAdvance = (): boolean => {
    switch (step) {
      case "name":
        return form.businessName.trim().length >= 2;
      case "kind":
        return form.businessType !== null;
      case "place":
        return !!form.city && !!form.district;
      case "address":
        return form.address.trim().length >= 5 && form.coords !== null;
      case "owner":
        return form.ownerName.trim().length >= 2;
      case "account":
        return /.+@.+\..+/.test(form.email) && form.password.length >= 6;
      case "referral":
        return form.referralSource !== "";
      default:
        return true;
    }
  };

  const goNext = () => setIndex((i) => Math.min(i + 1, STEPS.length - 1));
  const goBack = () => setIndex((i) => Math.max(i - 1, 0));
  const skipIntro = () => setIndex(FIRST_FORM_INDEX);

  const submit = () => {
    startTransition(async () => {
      const res = await registerBusiness({
        businessName: form.businessName.trim(),
        businessType: form.businessType,
        city: form.city,
        district: form.district,
        address: form.address.trim(),
        latitude: form.coords?.lat,
        longitude: form.coords?.lng,
        ownerName: form.ownerName.trim(),
        ownerPhone: form.ownerPhone.trim() || undefined,
        email: form.email.trim(),
        password: form.password,
        referralSource: form.referralSource,
      });
      if (!res.success) {
        toast.error(res.error);
        // Genelde email çakışması olur — hesap adımına dön.
        setIndex(STEPS.indexOf("account"));
        return;
      }
      const signInRes = await signIn("credentials", {
        email: form.email.trim(),
        password: form.password,
        redirect: false,
      });
      if (signInRes?.error) {
        toast.error("Hesabın oluşturuldu ama giriş yapılamadı, lütfen giriş yap");
        router.push("/giris");
        return;
      }
      setDone(true);
    });
  };

  const primaryAction = () => {
    if (step === "referral") submit();
    else goNext();
  };

  if (done) {
    const firstName = form.ownerName.trim().split(" ")[0] || "hoş geldin";
    return (
      <Shell progress={1}>
        <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-app-accent-soft text-app-accent-soft-foreground">
            <Check className="size-8" />
          </div>
          <h1 className="font-grotesk mt-6 text-3xl font-bold tracking-tight text-balance">
            Hesabın hazır, {firstName}
          </h1>
          <p className="mt-3 max-w-sm text-muted-foreground">
            {form.businessName} artık Looea&apos;da. Panelden hizmetlerini ekle, çalışma
            saatlerini ayarla ve randevu almaya başla.
          </p>
          <button
            type="button"
            onClick={() => router.push("/business")}
            className={`${btn.primary} mt-8`}
          >
            Panele Git
            <ArrowRight className="size-4" />
          </button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell
      progress={progress}
      onSkip={isIntro ? skipIntro : undefined}
    >
      <div className="flex flex-1 flex-col justify-center py-8">
        {isIntro ? (
          <IntroSlide {...INTRO[index]} />
        ) : (
          <div className="mx-auto w-full max-w-md">
            <StepBody
              step={step}
              form={form}
              set={set}
              districts={districts}
              cityCenter={cityCenter}
              onEnterAdvance={() => canAdvance() && primaryAction()}
            />
          </div>
        )}
      </div>

      {/* Alt navigasyon */}
      <div className="mx-auto flex w-full max-w-md items-center gap-3 pb-8">
        {index > 0 && !done && (
          <button
            type="button"
            onClick={goBack}
            disabled={isPending}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
            aria-label="Geri"
          >
            <ArrowLeft className="size-4" />
          </button>
        )}
        <button
          type="button"
          onClick={primaryAction}
          disabled={!canAdvance() || isPending}
          className={`${btn.primary} flex-1`}
        >
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {step === "referral" ? "İşletmeni Oluştur" : "Devam"}
          {!isPending && <ArrowRight className="size-4" />}
        </button>
      </div>

      {index === 0 && (
        <p className="mx-auto -mt-4 w-full max-w-md pb-8 text-center text-sm text-muted-foreground">
          Zaten hesabın var mı?{" "}
          <Link href="/giris" className="font-medium text-app-accent hover:underline">
            Giriş Yap
          </Link>
        </p>
      )}
    </Shell>
  );
}

/* ---------- Shell (progress + iskelet) ---------- */

function Shell({
  children,
  progress,
  onSkip,
}: {
  children: React.ReactNode;
  progress: number;
  onSkip?: () => void;
}) {
  return (
    <div
      className={`${spaceGrotesk.variable} font-grotesk flex min-h-dvh flex-col bg-background px-6`}
    >
      <header className="mx-auto flex w-full max-w-md items-center gap-4 pt-6">
        <Link href="/" className="font-grotesk flex shrink-0 items-center gap-1.5 text-base font-bold tracking-tight">
          Looea
          <span className="rounded-md bg-app-accent px-1 py-0.5 text-[10px] font-bold text-white">Pro</span>
        </Link>
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-app-accent transition-[width] duration-300"
            style={{ width: `${Math.max(progress * 100, 4)}%` }}
          />
        </div>
        {onSkip ? (
          <button
            type="button"
            onClick={onSkip}
            className="shrink-0 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Atla
          </button>
        ) : (
          <span className="w-8 shrink-0" />
        )}
      </header>
      {children}
    </div>
  );
}

/* ---------- Intro slide ---------- */

function IntroSlide({
  icon: Icon,
  title,
  desc,
  mock,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
  mock: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center text-center">
      <div className="flex w-full justify-center">{mock}</div>
      <div className="mt-8 flex size-11 items-center justify-center rounded-full bg-app-accent-soft text-app-accent-soft-foreground">
        <Icon className="size-5" />
      </div>
      <h1 className="font-grotesk mt-4 text-3xl font-bold tracking-tight text-balance">{title}</h1>
      <p className="mt-3 max-w-sm text-muted-foreground text-pretty">{desc}</p>
    </div>
  );
}

/* ---------- Adım gövdesi ---------- */

function StepHeading({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-6">
      <h1 className="font-grotesk text-2xl font-bold tracking-tight text-balance">{title}</h1>
      {hint && <p className="mt-2 text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}

function StepBody({
  step,
  form,
  set,
  districts,
  cityCenter,
  onEnterAdvance,
}: {
  step: StepId;
  form: FormState;
  set: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  districts: { name: string; slug: string }[];
  cityCenter: LatLng;
  onEnterAdvance: () => void;
}) {
  const enterKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onEnterAdvance();
    }
  };

  switch (step) {
    case "name":
      return (
        <div>
          <StepHeading title="İşletmenin adı ne?" hint="Müşterilerinin göreceği isim." />
          <Input
            autoFocus
            value={form.businessName}
            onChange={(e) => set("businessName", e.target.value)}
            onKeyDown={enterKey}
            placeholder="Örn. Studio X"
            className={`h-12 text-base ${inputClass}`}
          />
        </div>
      );

    case "kind":
      return (
        <div>
          <StepHeading title="Ne tür bir işletmen var?" hint="Sana en uygun ayarları hazırlayalım." />
          <div className="grid gap-2.5 sm:grid-cols-2">
            {BUSINESS_KIND_OPTIONS.map((opt) => {
              const Icon = KIND_ICONS[opt.value];
              const active = form.businessType === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set("businessType", opt.value)}
                  className={`flex items-center gap-3 rounded-2xl border-2 p-3.5 text-left transition-colors ${
                    active
                      ? "border-app-accent bg-app-accent-soft"
                      : "border-border hover:border-app-accent/40"
                  }`}
                >
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
                      active ? "bg-app-accent text-white" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="size-4.5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{opt.label}</span>
                    <span className="block truncate text-xs text-muted-foreground">{opt.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      );

    case "place":
      return (
        <div>
          <StepHeading title="Nerede hizmet veriyorsun?" hint="İşletmenin bulunduğu il ve ilçe." />
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>İl</Label>
              <Select
                value={form.city || undefined}
                onValueChange={(v) => {
                  set("city", v);
                  set("district", "");
                }}
              >
                <SelectTrigger className={`h-12 w-full ${inputClass}`}>
                  <SelectValue placeholder="İl seç" />
                </SelectTrigger>
                <SelectContent>
                  {TR_PROVINCES.map((p) => (
                    <SelectItem key={p.slug} value={p.name}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>İlçe</Label>
              <Select
                value={form.district || undefined}
                onValueChange={(v) => set("district", v)}
                disabled={!form.city}
              >
                <SelectTrigger className={`h-12 w-full ${inputClass}`}>
                  <SelectValue placeholder={form.city ? "İlçe seç" : "Önce il seç"} />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((d) => (
                    <SelectItem key={d.slug} value={d.name}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      );

    case "address":
      return (
        <div>
          <StepHeading
            title="İşletmenin tam adresi"
            hint="Adresi yaz, sonra pin'i haritada tam konumuna sürükle."
          />
          <div className="space-y-3">
            <Input
              autoFocus
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="Mahalle, cadde, no"
              className={`h-12 text-base ${inputClass}`}
            />
            <LocationPicker
              value={form.coords}
              center={cityCenter}
              onChange={(c) => set("coords", c)}
              className="h-72 w-full border border-border"
            />
          </div>
        </div>
      );

    case "owner":
      return (
        <div>
          <StepHeading title="Seni tanıyalım" hint="Yetkili kişi bilgileri." />
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="ownerName">Ad Soyad</Label>
              <Input
                id="ownerName"
                autoFocus
                value={form.ownerName}
                onChange={(e) => set("ownerName", e.target.value)}
                onKeyDown={enterKey}
                placeholder="Ad Soyad"
                className={`h-12 text-base ${inputClass}`}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ownerPhone">Telefon (opsiyonel)</Label>
              <Input
                id="ownerPhone"
                type="tel"
                value={form.ownerPhone}
                onChange={(e) => set("ownerPhone", e.target.value)}
                onKeyDown={enterKey}
                placeholder="05xx xxx xx xx"
                className={`h-12 text-base ${inputClass}`}
              />
            </div>
          </div>
        </div>
      );

    case "account":
      return (
        <div>
          <StepHeading title="Giriş bilgilerin" hint="Panele bu bilgilerle giriş yapacaksın." />
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoFocus
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="ornek@isletme.com"
                className={`h-12 text-base ${inputClass}`}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                onKeyDown={enterKey}
                placeholder="En az 6 karakter"
                className={`h-12 text-base ${inputClass}`}
              />
            </div>
          </div>
        </div>
      );

    case "referral":
      return (
        <div>
          <StepHeading title="Bizi nereden duydun?" hint="Son bir soru — sonra hazırsın." />
          <div className="grid gap-2.5">
            {REFERRAL_SOURCE_OPTIONS.map((opt) => {
              const active = form.referralSource === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => set("referralSource", opt)}
                  className={`flex items-center justify-between rounded-2xl border-2 px-4 py-3.5 text-left text-sm font-medium transition-colors ${
                    active
                      ? "border-app-accent bg-app-accent-soft"
                      : "border-border hover:border-app-accent/40"
                  }`}
                >
                  {opt}
                  {active && <Check className="size-4 text-app-accent" />}
                </button>
              );
            })}
          </div>
        </div>
      );

    default:
      return null;
  }
}
