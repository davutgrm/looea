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
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/business/price";
import { SectionLabel, SectionNumeral } from "@/components/marketing/section-label";

const FEATURES = [
  {
    icon: CalendarCheck,
    title: "Akıllı takvim",
    desc: "Online randevular otomatik takvimine düşer. Çift rezervasyon yok, telefon trafiği yok.",
  },
  {
    icon: Users,
    title: "Personel yönetimi",
    desc: "Her çalışanın mesai ve molalarını tanımla, randevular müsaitliğe göre dağılsın.",
  },
  {
    icon: Star,
    title: "Doğrulanmış yorumlar",
    desc: "Sadece gerçekten hizmet alan müşteriler yorum yapar — güvenin gerçek olur.",
  },
  {
    icon: BarChart3,
    title: "İstatistikler",
    desc: "Doluluk, ciro ve müşteri sadakatini tek ekrandan takip et, kararlarını veriyle ver.",
  },
  {
    icon: Bell,
    title: "Otomatik hatırlatma",
    desc: "Müşterilere otomatik randevu hatırlatması — gelmeyen müşteri derdi azalır.",
  },
  {
    icon: Sparkles,
    title: "Vitrin profili",
    desc: "Çalışmalarını, hizmetlerini ve fiyatlarını sergile, Kuafi yeni müşteri getirsin.",
  },
];

const STEPS = [
  {
    n: "01",
    icon: Sparkles,
    title: "Profilini oluştur",
    desc: "Birkaç adımda işletmeni kaydet, hizmetlerini ve çalışanlarını ekle.",
  },
  {
    n: "02",
    icon: Clock,
    title: "Müsaitliğini bağla",
    desc: "Çalışma saatlerini ve personel mesaisini tanımla, takvim otomatik dolsun.",
  },
  {
    n: "03",
    icon: CalendarCheck,
    title: "Randevuları al",
    desc: "Müşteriler 7/24 online randevu alsın, sen işine odaklan.",
  },
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
  {
    q: "İlk ay gerçekten ücretsiz mi?",
    a: "Evet. İşletmeni kaydettiğinde ilk ay tamamen ücretsizdir, kart bilgisi olmadan başlayabilirsin.",
  },
  {
    q: "Komisyon alıyor musunuz?",
    a: "Hayır. Randevu başına komisyon yok. Tek bir aylık plan var: 499₺/ay, hepsi bu.",
  },
  {
    q: "Kurulum ne kadar sürer?",
    a: "Birkaç dakika. Profilini oluştur, hizmet ve çalışanlarını ekle, çalışma saatlerini gir — randevu almaya hazırsın.",
  },
  {
    q: "İstediğim zaman iptal edebilir miyim?",
    a: "Evet. Taahhüt yok, istediğin an üyeliğini durdurabilirsin.",
  },
];

export default function ProLandingPage() {
  return (
    <div className="overflow-x-clip">
      {/* Hero */}
      <section className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px] bg-[radial-gradient(ellipse_55%_50%_at_50%_0%,rgba(162,28,219,0.14),transparent_70%)]"
        />
        <div className="mx-auto max-w-2xl px-4 pt-16 pb-20 text-center md:pt-24 md:pb-28">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
            <Sparkles className="size-3.5" /> İlk ay ücretsiz — kart gerekmez
          </span>
          <h1 className="font-grotesk mx-auto mt-6 max-w-xl text-5xl leading-[1.08] font-bold tracking-tight text-balance md:text-6xl">
            <span className="block">İşini büyüt,</span>
            <span className="mt-1 block">
              <span className="font-instrument text-[0.88em] text-violet-600 italic">takvimini doldur</span>.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-lg text-muted-foreground text-pretty">
            Instagram DM&apos;i ve telefon trafiğini bırak. Kuaför, berber ve güzellik
            salonun için online randevu sistemi — Kuafi yeni müşterileri sana getirsin.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/isletme-kaydet"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-700 sm:w-auto"
            >
              İşletmeni Ücretsiz Kaydet
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/giris"
              className="inline-flex w-full items-center justify-center rounded-full border border-black/10 px-6 py-3 text-sm font-semibold transition-colors hover:bg-secondary sm:w-auto dark:border-white/15"
            >
              İşletme Girişi
            </Link>
          </div>

          <div className="mt-12 flex justify-center gap-10 text-sm">
            <div>
              <div className="font-grotesk text-2xl font-bold">7/24</div>
              <div className="text-muted-foreground">Online randevu</div>
            </div>
            <div>
              <div className="font-grotesk text-2xl font-bold">%0</div>
              <div className="text-muted-foreground">Komisyon</div>
            </div>
            <div>
              <div className="font-grotesk text-2xl font-bold">1 ay</div>
              <div className="text-muted-foreground">Ücretsiz</div>
            </div>
          </div>
        </div>
      </section>

      {/* 01 / Özellikler */}
      <section id="ozellikler" className="relative border-t border-black/5 py-24 dark:border-white/10">
        <SectionNumeral n="01" className="left-1/2 -translate-x-1/2" />
        <div className="relative mx-auto max-w-6xl px-4">
          <SectionLabel index="01" label="Özellikler" align="center" />
          <h2 className="font-grotesk mx-auto mt-4 max-w-2xl text-center text-4xl font-bold tracking-tight text-balance">
            İşletmeni yönetmek için{" "}
            <span className="font-instrument text-[0.88em] text-violet-600 italic">her şey</span> burada.
          </h2>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-[22px] border border-black/5 bg-card p-6 shadow-sm dark:border-white/10"
              >
                <div className="flex size-11 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                  <f.icon className="size-5" />
                </div>
                <h3 className="font-grotesk mt-4 font-bold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 02 / Nasıl çalışır */}
      <section id="nasil-calisir" className="border-t border-black/5 bg-secondary/30 py-24 dark:border-white/10">
        <div className="mx-auto max-w-6xl px-4">
          <SectionLabel index="02" label="Nasıl Çalışır" align="center" />
          <h2 className="font-grotesk mx-auto mt-4 max-w-2xl text-center text-4xl font-bold tracking-tight text-balance">
            Üç adımda{" "}
            <span className="font-instrument text-[0.88em] text-violet-600 italic">randevu almaya başla</span>.
          </h2>

          <div className="mt-16 grid gap-10 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.title} className="relative overflow-hidden">
                <span className="font-grotesk pointer-events-none absolute -top-6 -left-2 text-8xl font-bold text-black/[0.04] select-none dark:text-white/[0.04]">
                  {s.n}
                </span>
                <div className="relative flex size-12 items-center justify-center rounded-full bg-violet-600 text-white">
                  <s.icon className="size-5" />
                </div>
                <h3 className="font-grotesk relative mt-5 text-lg font-bold">{s.title}</h3>
                <p className="relative mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 03 / Fiyat */}
      <section id="fiyat" className="border-t border-black/5 py-24 dark:border-white/10">
        <div className="mx-auto max-w-4xl px-4">
          <SectionLabel index="03" label="Fiyat" align="center" />
          <h2 className="font-grotesk mx-auto mt-4 max-w-2xl text-center text-4xl font-bold tracking-tight text-balance">
            Tek plan,{" "}
            <span className="font-instrument text-[0.88em] text-violet-600 italic">gizli ücret yok</span>.
          </h2>

          <div className="relative mx-auto mt-14 max-w-sm overflow-hidden rounded-[28px] border border-violet-600/20 bg-card p-8 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04),0_32px_60px_-24px_rgba(0,0,0,0.25)]">
            <Badge variant="accent" className="mx-auto">
              <Wallet className="size-3.5" /> İlk ay ücretsiz
            </Badge>
            <h3 className="font-grotesk mt-4 text-2xl font-bold">Kuafi Pro</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Randevularını yönet, yeni müşteri kazan.
            </p>

            <div className="mt-6 flex items-baseline justify-center gap-1.5">
              <span className="font-grotesk text-5xl font-bold tracking-tight">
                <Price amount={499} />
              </span>
              <span className="text-muted-foreground">/ ay</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Ayda tek yeni müşteri getirse kendini karşılar.
            </p>

            <Link
              href="/isletme-kaydet"
              className="mt-8 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
            >
              Hemen Başla
              <ArrowRight className="size-4" />
            </Link>

            <ul className="mt-8 space-y-2.5 text-left">
              {PLAN_FEATURES.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-violet-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 04 / SSS */}
      <section id="sss" className="border-t border-black/5 bg-secondary/30 py-24 dark:border-white/10">
        <div className="mx-auto max-w-3xl px-4">
          <SectionLabel index="04" label="SSS" align="center" />
          <h2 className="font-grotesk mx-auto mt-4 max-w-2xl text-center text-4xl font-bold tracking-tight text-balance">
            Sıkça sorulan{" "}
            <span className="font-instrument text-[0.88em] text-violet-600 italic">sorular</span>.
          </h2>
          <Accordion type="single" collapsible className="mt-12">
            {FAQ.map((item) => (
              <AccordionItem key={item.q} value={item.q}>
                <AccordionTrigger className="font-grotesk text-base font-semibold">{item.q}</AccordionTrigger>
                <AccordionContent>{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-black/5 py-24 dark:border-white/10">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-grotesk mx-auto max-w-xl text-4xl font-bold tracking-tight text-balance">
            İşletmeni bugün{" "}
            <span className="font-instrument text-[0.88em] text-violet-600 italic">Kuafi&apos;ye taşı</span>.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            İlk ay ücretsiz, komisyon yok, taahhüt yok. Kurulum birkaç dakika.
          </p>
          <Link
            href="/isletme-kaydet"
            className="mt-8 inline-flex items-center justify-center gap-1.5 rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
          >
            İşletmeni Ücretsiz Kaydet
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
