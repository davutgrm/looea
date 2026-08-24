import Link from "next/link";
import Image from "next/image";
import {
  Search,
  CalendarCheck,
  Star,
  ShieldCheck,
  Scissors,
  Sparkles,
  Gem,
  Check,
  X,
  Smartphone,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { prisma } from "@/lib/prisma";
import { getFeaturedBusinesses } from "@/lib/data/business";
import { getCategoriesGrouped, GROUP_LABELS } from "@/lib/data/categories";
import { SectionLabel, SectionNumeral } from "@/components/marketing/section-label";
import { ShowcaseCard } from "@/components/marketing/showcase-card";
import { HeroSearch } from "@/components/marketing/hero-search";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/business/price";

const GROUP_ICONS: Record<string, typeof Scissors> = {
  SAC: Scissors,
  GUZELLIK: Sparkles,
  TIRNAK: Gem,
  OZEL: Star,
};

const COMPARISON_ROWS = [
  "7/24 online randevu",
  "Anında onay, bekleme yok",
  "Gerçek, doğrulanmış yorumlar",
  "Şeffaf fiyat listesi",
  "Otomatik hatırlatma bildirimi",
  "Randevu geçmişi ve favoriler",
];

export default async function LandingPage() {
  const [featuredBusinesses, businessCount, reviews, reviewAgg, categoriesGrouped] = await Promise.all([
    getFeaturedBusinesses(null, 8),
    prisma.business.count({ where: { active: true } }),
    prisma.review.findMany({
      where: { hidden: false, rating: { gte: 4 } },
      include: {
        customer: { select: { name: true } },
        business: { select: { name: true, location: { select: { city: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.review.aggregate({
      where: { hidden: false },
      _avg: { rating: true },
      _count: { _all: true },
    }),
    getCategoriesGrouped(),
  ]);

  const avgRating = reviewAgg._avg.rating ?? 0;
  const reviewCount = reviewAgg._count._all;
  const proPhoto = featuredBusinesses[2]?.coverImageUrl ?? featuredBusinesses[0]?.coverImageUrl;
  const showcaseBusiness =
    featuredBusinesses.find((b) => b.type !== "NAIL_SALON") ?? featuredBusinesses[0];

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
            <Sparkles className="size-3.5" /> Türkiye&apos;nin randevu platformu
          </span>
          <h1 className="font-grotesk mx-auto mt-6 max-w-xl text-5xl leading-[1.08] font-bold tracking-tight text-balance md:text-6xl">
            <span className="block">Yakınındaki</span>
            <span className="mt-1 block">
              <span className="font-instrument text-[0.88em] text-violet-600 italic">en iyi kuaförü</span> bul.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-lg text-muted-foreground text-pretty">
            Instagram DM&apos;i ve telefon trafiğini bırak. Çalışmaları gör, fiyatları
            karşılaştır, randevunu saniyeler içinde oluştur.
          </p>

          <div className="mt-9">
            <HeroSearch />
          </div>

          <div className="mt-12 flex justify-center gap-10 text-sm">
            <div>
              <div className="font-grotesk text-2xl font-bold">{businessCount}+</div>
              <div className="text-muted-foreground">Kayıtlı işletme</div>
            </div>
            <div>
              <div className="font-grotesk text-2xl font-bold">
                {avgRating > 0 ? avgRating.toFixed(1).replace(".", ",") : "—"}
              </div>
              <div className="text-muted-foreground">{reviewCount}+ yorum</div>
            </div>
            <div>
              <div className="font-grotesk text-2xl font-bold">7/24</div>
              <div className="text-muted-foreground">Online randevu</div>
            </div>
          </div>
        </div>
      </section>

      {/* 01 / Topluluk & yorumlar */}
      <section id="topluluk" className="relative overflow-hidden border-t border-black/5 py-24 dark:border-white/10">
        <SectionNumeral n="01" className="left-1/2 -translate-x-1/2" />
        <div className="relative mx-auto max-w-6xl px-4">
          <SectionLabel index="01" label="Topluluk" align="center" />
          <h2 className="font-grotesk mx-auto mt-4 max-w-2xl text-center text-4xl font-bold tracking-tight text-balance">
            Binlerce müşterinin{" "}
            <span className="font-instrument text-[0.88em] text-violet-600 italic">güvendiği</span> bir
            topluluk.
          </h2>
          {reviewCount > 0 && (
            <p className="mt-4 flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Star className="size-4 fill-violet-600 text-violet-600" />
              {avgRating.toFixed(1).replace(".", ",")} · {reviewCount}+ yorum
            </p>
          )}

          {reviews.length > 0 && (
            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {reviews.map((r) => (
                <div key={r.id} className="rounded-[22px] border border-black/5 bg-card p-6 shadow-sm dark:border-white/10">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`size-4 ${i < r.rating ? "fill-violet-600 text-violet-600" : "text-muted"}`}
                      />
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-foreground/80">&ldquo;{r.comment}&rdquo;</p>
                  <div className="mt-5 flex items-center gap-2.5">
                    <div className="font-grotesk flex size-9 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                      {r.customer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{r.customer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.business.name}
                        {r.business.location?.city ? `, ${r.business.location.city}` : ""}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {featuredBusinesses.length > 0 && (
            <div className="mt-14 -mx-4 flex snap-x gap-5 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {featuredBusinesses.map((b) => (
                <div key={b.id} className="w-64 shrink-0 snap-start">
                  <ShowcaseCard business={b} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 02 / Hizmetler */}
      <section id="hizmetler" className="border-t border-black/5 bg-secondary/30 py-24 dark:border-white/10">
        <div className="mx-auto max-w-6xl px-4">
          <SectionLabel index="02" label="Hizmetler" align="center" />
          <h2 className="font-grotesk mx-auto mt-4 max-w-2xl text-center text-4xl font-bold tracking-tight text-balance">
            Saçından tırnağına,{" "}
            <span className="font-instrument text-[0.88em] text-violet-600 italic">tek adreste</span>.
          </h2>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(categoriesGrouped).map(([group, categories]) => {
              const Icon = GROUP_ICONS[group] ?? Sparkles;
              return (
                <Link
                  key={group}
                  href={`/ara?kategori=${categories[0]?.slug ?? ""}`}
                  className="group rounded-[22px] border border-black/5 bg-card p-6 shadow-sm transition-shadow hover:shadow-md dark:border-white/10"
                >
                  <div className="flex size-11 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="font-grotesk mt-4 font-bold">{GROUP_LABELS[group] ?? group}</h3>
                  <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                    {categories.map((c) => c.name).join(", ")}
                  </p>
                  <span className="mt-4 inline-block text-sm font-semibold text-violet-600 group-hover:underline">
                    Keşfet →
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 03 / Nasıl çalışır */}
      <section id="nasil-calisir" className="relative py-24">
        <div className="mx-auto max-w-6xl px-4">
          <SectionLabel index="03" label="Nasıl Çalışır" align="center" />
          <h2 className="font-grotesk mx-auto mt-4 max-w-2xl text-center text-4xl font-bold tracking-tight text-balance">
            Üç adımda{" "}
            <span className="font-instrument text-[0.88em] text-violet-600 italic">randevu senin</span>.
          </h2>

          <div className="mt-16 grid gap-10 md:grid-cols-3">
            {[
              { n: "01", icon: Search, title: "Keşfet", desc: "Yakınındaki kuaförleri, berberleri ve güzellik salonlarını keşfet, çalışmalarını ve yorumları incele." },
              { n: "02", icon: ShieldCheck, title: "Karşılaştır", desc: "Gerçek yorumlar, doğrulanmış profiller ve şeffaf fiyatlarla güvenle seç." },
              { n: "03", icon: CalendarCheck, title: "Randevu Al", desc: "Müsait saati seç, birkaç adımda randevunu oluştur, hatırlatmalarla asla unutma." },
            ].map((s) => (
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

      {/* 04 / Kuaförler için */}
      <section id="kuaforler-icin" className="relative overflow-hidden bg-gradient-to-b from-violet-950 via-violet-950 to-black py-24 text-white">
        <SectionNumeral n="04" className="right-4 text-white/[0.04] md:right-10" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 md:grid-cols-2">
          <div>
            <SectionLabel index="04" label="Kuaförler İçin" className="text-violet-300" />
            <h2 className="font-grotesk mt-4 text-4xl font-bold tracking-tight text-balance">
              İşini büyüt,{" "}
              <span className="font-instrument text-[0.88em] text-violet-300 italic">takvimini doldur</span>.
            </h2>
            <p className="mt-4 max-w-md text-white/60">
              Profilini oluştur, hizmetlerini ve çalışanlarını yönet, müsaitliğini otomatik
              takvime bağla — Kuafi yeni müşterileri sana getirsin.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                "İlk ay ücretsiz, komisyon yok",
                "Gerçek zamanlı takvim ve personel yönetimi",
                "Doğrulanmış müşteri yorumları ile güven kazan",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-white/80">
                  <Check className="mt-0.5 size-4 shrink-0 text-violet-400" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/isletme-kaydet"
              className="mt-8 inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-white/90"
            >
              İşletmeni Ücretsiz Kaydet
            </Link>
          </div>

          <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[28px] md:justify-self-end">
            {proPhoto && (
              <Image
                src={proPhoto}
                alt="Kuaförler için Kuafi"
                fill
                sizes="(max-width: 768px) 90vw, 400px"
                className="object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-violet-950/60 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      {/* 05 / Üyelik */}
      <section id="uyelik" className="border-t border-black/5 py-24 dark:border-white/10">
        <div className="mx-auto max-w-4xl px-4">
          <SectionLabel index="05" label="Üyelik" align="center" />
          <h2 className="font-grotesk mx-auto mt-4 max-w-2xl text-center text-4xl font-bold tracking-tight text-balance">
            Tek plan,{" "}
            <span className="font-instrument text-[0.88em] text-violet-600 italic">gizli ücret yok</span>.
          </h2>

          <div className="relative mx-auto mt-14 max-w-sm overflow-hidden rounded-[28px] border border-violet-600/20 bg-card p-8 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04),0_32px_60px_-24px_rgba(0,0,0,0.25)]">
            <Badge variant="accent" className="mx-auto">Popüler</Badge>
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

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/isletme-kaydet"
                className="inline-flex flex-1 items-center justify-center rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
              >
                Hemen Başla
              </Link>
              <a
                href="mailto:destek@kuafi.app"
                className="inline-flex flex-1 items-center justify-center rounded-full border border-black/10 px-6 py-3 text-sm font-semibold transition-colors hover:bg-secondary dark:border-white/15"
              >
                Bize Ulaşın
              </a>
            </div>

            <ul className="mt-8 space-y-2.5 text-left">
              {["Sınırsız randevu", "Komisyon yok", "Taahhüt yok", "İlk ay ücretsiz"].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-violet-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 06 / Karşılaştırma */}
      <section id="karsilastirma" className="py-24">
        <div className="mx-auto max-w-4xl px-4">
          <SectionLabel index="06" label="Karşılaştırma" align="center" />
          <h2 className="font-grotesk mx-auto mt-4 max-w-2xl text-center text-4xl font-bold tracking-tight text-balance">
            Diğerleri defterle çalışır.{" "}
            <span className="font-instrument text-[0.88em] text-violet-600 italic">Kuafi&apos;de saniyede randevu.</span>
          </h2>

          <div className="mt-14 overflow-hidden rounded-[22px] border border-black/5 dark:border-white/10">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/10">
                  <th className="p-4 text-left font-medium text-muted-foreground"></th>
                  <th className="font-grotesk p-4 text-center text-base font-bold text-violet-600">Kuafi</th>
                  <th className="p-4 text-center font-medium text-muted-foreground">Instagram DM</th>
                  <th className="p-4 text-center font-medium text-muted-foreground">Telefon / Defter</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr key={row} className={i % 2 === 0 ? "bg-secondary/30" : ""}>
                    <td className="p-4 font-medium">{row}</td>
                    <td className="bg-violet-50 p-4 text-center dark:bg-violet-500/10">
                      <Check className="mx-auto size-4.5 text-violet-600" />
                    </td>
                    <td className="p-4 text-center">
                      <X className="mx-auto size-4.5 text-muted-foreground/40" />
                    </td>
                    <td className="p-4 text-center">
                      <X className="mx-auto size-4.5 text-muted-foreground/40" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 07 / SSS */}
      <section id="sss" className="border-t border-black/5 bg-secondary/30 py-24 dark:border-white/10">
        <div className="mx-auto max-w-3xl px-4">
          <SectionLabel index="07" label="SSS" align="center" />
          <h2 className="font-grotesk mx-auto mt-4 max-w-2xl text-center text-4xl font-bold tracking-tight text-balance">
            Sıkça sorulan{" "}
            <span className="font-instrument text-[0.88em] text-violet-600 italic">sorular</span>.
          </h2>
          <Accordion type="single" collapsible className="mt-12">
            {[
              { q: "Kuafi kullanmak ücretsiz mi?", a: "Müşteriler için Kuafi tamamen ücretsizdir. İşletmeler için tek bir Kuafi Pro planı vardır, ilk ay ücretsizdir." },
              { q: "Randevumu nasıl iptal ederim?", a: "Randevularım sayfasından ilgili randevuyu seçip iptal edebilirsin." },
              { q: "Yorumlar gerçek mi?", a: "Evet. Sadece o işletmeden gerçekten randevu almış ve hizmeti tamamlamış müşteriler yorum yapabilir." },
              { q: "İşletmemi nasıl kaydederim?", a: "\"İşletmeni Kaydet\" butonuna tıklayıp birkaç adımda profilini oluşturabilirsin." },
            ].map((item) => (
              <AccordionItem key={item.q} value={item.q}>
                <AccordionTrigger className="font-grotesk text-base font-semibold">{item.q}</AccordionTrigger>
                <AccordionContent>{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Uygulama */}
      <section className="border-t border-black/5 py-24 dark:border-white/10">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 md:grid-cols-2">
          <div className="text-center md:text-left">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-violet-100 text-violet-700 md:mx-0 dark:bg-violet-500/15 dark:text-violet-300">
              <Smartphone className="size-6" />
            </div>
            <h2 className="font-grotesk mt-6 text-4xl font-bold tracking-tight text-balance">
              Cebinde de{" "}
              <span className="font-instrument text-[0.88em] text-violet-600 italic">yanında</span>.
            </h2>
            <p className="mx-auto mt-4 max-w-sm text-muted-foreground md:mx-0">
              Kuafi mobil uygulaması yakında App Store ve Google Play&apos;de. Şimdilik web
              uygulamasını telefonundan da sorunsuzca kullanabilirsin.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <span className="relative flex items-center gap-2 rounded-xl border border-black/10 px-4 py-2.5 text-sm font-medium text-muted-foreground opacity-60 dark:border-white/15">
                App Store
                <span className="absolute -top-2 -right-2 rounded-full bg-violet-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                  YAKINDA
                </span>
              </span>
              <span className="relative flex items-center gap-2 rounded-xl border border-black/10 px-4 py-2.5 text-sm font-medium text-muted-foreground opacity-60 dark:border-white/15">
                Google Play
                <span className="absolute -top-2 -right-2 rounded-full bg-violet-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                  YAKINDA
                </span>
              </span>
            </div>
            <Link
              href="/kesfet"
              className="mt-8 inline-block rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
            >
              Şimdi Web&apos;de Dene
            </Link>
          </div>

          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm">
            <div className="relative h-full w-full overflow-hidden rounded-[28px] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_32px_60px_-24px_rgba(0,0,0,0.25)]">
              {showcaseBusiness?.coverImageUrl && (
                <Image
                  src={showcaseBusiness.coverImageUrl}
                  alt={showcaseBusiness.name}
                  fill
                  sizes="(max-width: 768px) 90vw, 400px"
                  className="object-cover"
                />
              )}
            </div>
            {showcaseBusiness && (
              <div className="absolute -bottom-8 -left-8 w-56 rotate-[-4deg]">
                <ShowcaseCard business={showcaseBusiness} />
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
