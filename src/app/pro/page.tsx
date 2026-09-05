import Link from "next/link";
import {
  CalendarCheck,
  Users,
  Star,
  BarChart3,
  Bell,
  Sparkles,
  Check,
  Clock,
  Wallet,
  ArrowRight,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Price } from "@/components/business/price";
import { MockCalendarCard, MockStatsCard } from "@/components/pro-onboarding/mockups";
import { Reveal } from "@/components/ui/reveal";
import { type, layout, btn } from "@/lib/design-tokens";

const SMALL_FEATURES = [
  { icon: Users, title: "Personel yönetimi", desc: "Her çalışanın mesai ve molalarını tanımla; randevular müsaitliğe göre dağılsın." },
  { icon: Star, title: "Doğrulanmış yorumlar", desc: "Sadece gerçekten hizmet alan müşteriler yorum yapar — güvenin gerçek olur." },
  { icon: Bell, title: "Otomatik hatırlatma", desc: "Müşterilere otomatik randevu hatırlatması; gelmeyen müşteri derdi azalır." },
  { icon: Sparkles, title: "Vitrin profili", desc: "Çalışmalarını, hizmetlerini ve fiyatlarını sergile; Looea yeni müşteri getirsin." },
];

const STEPS = [
  { n: "01", icon: Sparkles, title: "Profilini oluştur", desc: "Birkaç adımda işletmeni kaydet, hizmetlerini ve çalışanlarını ekle." },
  { n: "02", icon: Clock, title: "Müsaitliğini bağla", desc: "Çalışma saatlerini ve personel mesaisini tanımla; takvim otomatik dolsun." },
  { n: "03", icon: CalendarCheck, title: "Randevuları al", desc: "Müşteriler 7/24 online randevu alsın, sen işine odaklan." },
];

const PLAN_FEATURES = [
  "Sınırsız online randevu",
  "Takvim ve personel yönetimi",
  "Doğrulanmış müşteri yorumları",
  "İstatistik paneli",
  "Otomatik hatırlatmalar",
  "Komisyon yok, taahhüt yok",
];

const FAQ = [
  { q: "İlk ay gerçekten ücretsiz mi?", a: "Evet. Kayıt olduğunda 30 gün boyunca Looea Pro'nun tüm özelliklerini ücretsiz kullanırsın, kredi kartı bilgisi istenmez. Deneme bitince devam etmek istersen aylık 499₺ ödemeye başlarsın." },
  { q: "Komisyon alıyor musunuz?", a: "Hayır. Aldığın her randevudan sana ait olan tutarın tamamı sende kalır — Looea randevu başına hiçbir kesinti yapmaz. Tek maliyetin aylık sabit abonelik ücreti." },
  { q: "Kurulum ne kadar sürer?", a: "Ortalama 5-10 dakika. İşletme bilgilerini, hizmetlerini ve çalışma saatlerini girdikten sonra profilin yayına alınır ve randevu almaya başlayabilirsin." },
  { q: "İstediğim zaman iptal edebilir miyim?", a: "Evet, herhangi bir taahhüt yok. İstediğin an aboneliğini durdurabilirsin, ek ücret veya ceza uygulanmaz." },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-app-accent uppercase">
      <span className="h-px w-6 bg-app-accent/50" />
      {children}
    </span>
  );
}

export default function ProLandingPage() {
  return (
    <div className="overflow-x-clip">
      {/* ── Hero: asimetrik, ürün önde ── */}
      <section className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] bg-[radial-gradient(70%_60%_at_15%_0%,rgba(162,28,219,0.10),transparent_70%)]"
        />
        <div className={`${layout.container} grid items-center gap-12 py-16 md:grid-cols-[1.05fr_0.95fr] md:py-24`}>
          <div>
            <Eyebrow>Looea Pro</Eyebrow>
            <h1 className={`${type.display} mt-5`}>
              İşini büyüt,{" "}
              <span className="font-instrument text-[0.9em] font-normal text-app-accent italic">
                takvimini doldur
              </span>
              .
            </h1>
            <p className={`${type.bodyLg} mt-5 max-w-md`}>
              Kuaför, berber ve güzellik salonun için online randevu sistemi. Telefon
              trafiğini bırak; Looea yeni müşterileri sana getirsin.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/isletme-kaydet" className={btn.primary}>
                İşletmeni Ücretsiz Kaydet <ArrowRight className="size-4" />
              </Link>
              <Link href="/giris" className={btn.secondary}>
                İşletme Girişi
              </Link>
            </div>

            <dl className="mt-10 flex gap-8">
              {[
                ["7/24", "Online randevu"],
                ["%0", "Komisyon"],
                ["1 ay", "Ücretsiz"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="font-grotesk text-2xl font-bold tracking-tight">{v}</dt>
                  <dd className="text-sm text-muted-foreground">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Ürün mockup kümesi */}
          <div className="relative mx-auto hidden h-[440px] w-full max-w-md md:block" aria-hidden>
            <div className="absolute top-1 left-1 rotate-[-3deg]">
              <MockCalendarCard />
            </div>
            <div className="absolute right-0 bottom-1 w-64 rotate-[3deg]">
              <MockStatsCard />
            </div>
          </div>
        </div>
      </section>

      {/* ── Güven şeridi ── */}
      <section className="border-y border-border bg-secondary/40">
        <div className={`${layout.container} flex flex-wrap items-center justify-center gap-x-10 gap-y-3 py-5 text-sm`}>
          <span className="flex items-center gap-2 font-medium">
            <Wallet className="size-4 text-app-accent" /> İlk ay ücretsiz — kart gerekmez
          </span>
          <span className="flex items-center gap-2 text-muted-foreground">
            <Check className="size-4 text-app-accent" /> Komisyon yok
          </span>
          <span className="flex items-center gap-2 text-muted-foreground">
            <Check className="size-4 text-app-accent" /> Taahhüt yok, istediğin an iptal
          </span>
        </div>
      </section>

      {/* ── Özellikler: bento (büyük takvim tile + küçükler) ── */}
      <section id="ozellikler" className={layout.sectionY}>
        <div className={layout.container}>
          <Reveal className="max-w-2xl">
            <Eyebrow>Özellikler</Eyebrow>
            <h2 className={`${type.h1} mt-4`}>
              İşletmeni yönetmek için{" "}
              <span className="font-instrument text-[0.9em] font-normal text-app-accent italic">her şey</span> burada.
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {/* Büyük takvim tile */}
            <Reveal className="lg:col-span-2">
              <div className="flex h-full flex-col justify-between gap-6 overflow-hidden rounded-2xl bg-card p-7 shadow-e1 ring-1 ring-foreground/[0.06] sm:flex-row sm:items-center">
                <div className="sm:max-w-xs">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-app-accent-soft text-app-accent-soft-foreground">
                    <CalendarCheck className="size-5" />
                  </span>
                  <h3 className={`${type.h3} mt-5`}>Akıllı takvim</h3>
                  <p className="mt-2 text-muted-foreground">
                    Online randevular otomatik takvimine düşer. Çift rezervasyon yok, telefon
                    trafiği yok.
                  </p>
                </div>
                <div className="shrink-0" aria-hidden>
                  <MockCalendarCard />
                </div>
              </div>
            </Reveal>

            {/* İstatistik tile */}
            <Reveal delay={80}>
              <div className="flex h-full flex-col justify-between gap-6 rounded-2xl bg-card p-7 shadow-e1 ring-1 ring-foreground/[0.06]">
                <div>
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-app-accent-soft text-app-accent-soft-foreground">
                    <BarChart3 className="size-5" />
                  </span>
                  <h3 className={`${type.h3} mt-5`}>İstatistikler</h3>
                  <p className="mt-2 text-muted-foreground">
                    Doluluk, ciro ve müşteri sadakatini tek ekrandan takip et.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Küçük özellikler */}
            {SMALL_FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 60}>
                <div className="h-full rounded-2xl bg-card p-6 shadow-e1 ring-1 ring-foreground/[0.06]">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-app-accent-soft text-app-accent-soft-foreground">
                    <f.icon className="size-5" />
                  </span>
                  <h3 className="font-grotesk mt-4 font-bold">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Nasıl çalışır: bağlı zaman çizelgesi ── */}
      <section id="nasil-calisir" className={`${layout.sectionY} border-t border-border bg-secondary/30`}>
        <div className={layout.container}>
          <Reveal className="max-w-2xl">
            <Eyebrow>Nasıl çalışır</Eyebrow>
            <h2 className={`${type.h1} mt-4`}>
              Üç adımda{" "}
              <span className="font-instrument text-[0.9em] font-normal text-app-accent italic">randevu almaya başla</span>.
            </h2>
          </Reveal>
          <div className="relative mt-12 grid gap-8 md:grid-cols-3">
            <div aria-hidden className="absolute top-6 right-[16%] left-[16%] hidden h-px bg-border md:block" />
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 90} className="relative">
                <div className="flex items-center gap-3">
                  <span className="relative z-10 flex size-12 items-center justify-center rounded-full bg-app-accent text-app-accent-foreground">
                    <s.icon className="size-5" />
                  </span>
                  <span className="font-grotesk text-sm font-semibold text-muted-foreground">{s.n}</span>
                </div>
                <h3 className={`${type.h3} mt-5`}>{s.title}</h3>
                <p className="mt-2 text-muted-foreground">{s.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fiyat: iki kolon (ifade + plan kartı) ── */}
      <section id="fiyat" className={layout.sectionY}>
        <div className={`${layout.container} grid items-center gap-12 md:grid-cols-2`}>
          <Reveal>
            <Eyebrow>Fiyat</Eyebrow>
            <h2 className={`${type.h1} mt-4`}>
              Tek plan,{" "}
              <span className="font-instrument text-[0.9em] font-normal text-app-accent italic">gizli ücret yok</span>.
            </h2>
            <p className="mt-4 max-w-md text-muted-foreground">
              Komisyon yok, taahhüt yok. Ayda tek yeni müşteri getirse Looea Pro kendini
              karşılar. İlk ay tamamen ücretsiz.
            </p>
            <ul className="mt-8 grid max-w-md gap-2.5 sm:grid-cols-2">
              {PLAN_FEATURES.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-app-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={80} className="mx-auto w-full max-w-sm">
            <div className="overflow-hidden rounded-[28px] bg-card p-8 text-center shadow-e2 ring-1 ring-app-accent/20">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-app-accent-soft px-3 py-1 text-xs font-semibold text-app-accent-soft-foreground">
                <Wallet className="size-3.5" /> İlk ay ücretsiz
              </span>
              <h3 className="font-grotesk mt-4 text-2xl font-bold">Looea Pro</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">Randevularını yönet, yeni müşteri kazan.</p>
              <div className="mt-6 flex items-baseline justify-center gap-1.5">
                <span className="font-grotesk text-5xl font-bold tracking-tight">
                  <Price amount={499} />
                </span>
                <span className="text-muted-foreground">/ ay</span>
              </div>
              <Link href="/isletme-kaydet" className={`${btn.primary} mt-8 w-full`}>
                Hemen Başla <ArrowRight className="size-4" />
              </Link>
              <p className="mt-3 text-xs text-muted-foreground">Kart bilgisi olmadan başla.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── SSS ── */}
      <section id="sss" className={`${layout.sectionY} border-t border-border bg-secondary/30`}>
        <div className={layout.containerNarrow}>
          <Reveal className="text-center">
            <Eyebrow>SSS</Eyebrow>
            <h2 className={`${type.h1} mx-auto mt-4 max-w-2xl`}>
              Sıkça sorulan{" "}
              <span className="font-instrument text-[0.9em] font-normal text-app-accent italic">sorular</span>.
            </h2>
          </Reveal>
          <Accordion type="single" collapsible className="mt-10">
            {FAQ.map((item) => (
              <AccordionItem key={item.q} value={item.q}>
                <AccordionTrigger className="font-grotesk text-base font-semibold">{item.q}</AccordionTrigger>
                <AccordionContent>{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ── Final CTA: koyu bölüm ── */}
      <section className="bg-neutral-950 text-white">
        <div className={`${layout.container} flex flex-col items-center gap-6 py-20 text-center md:py-28`}>
          <h2 className={`${type.h1} max-w-2xl`}>
            İşletmeni bugün{" "}
            <span className="font-instrument text-[0.9em] font-normal text-app-accent italic">Looea&apos;ya taşı</span>.
          </h2>
          <p className="max-w-md text-white/60">
            İlk ay ücretsiz, komisyon yok, taahhüt yok. Kurulum birkaç dakika.
          </p>
          <Link href="/isletme-kaydet" className={btn.primary}>
            İşletmeni Ücretsiz Kaydet <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
