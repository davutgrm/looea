import Link from "next/link";
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
  ArrowRight,
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
import { ShowcaseCard } from "@/components/marketing/showcase-card";
import { HeroSearch } from "@/components/marketing/hero-search";
import { SalonCardMock, SlotPickerMock } from "@/components/marketing/product-mockups";
import { Reveal } from "@/components/ui/reveal";
import { type, layout, btn } from "@/lib/design-tokens";
import { proHref } from "@/lib/domains";

// Business/review counts and lists are read directly via Prisma (no `fetch`),
// so this is the page-level ISR knob: falls back to a background refresh at
// most this often. registerBusiness/submitReview also call revalidatePath("/")
// for near-instant reflection of the two events that matter most.
export const revalidate = 180;

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

const HOW_STEPS = [
  { n: "01", icon: Search, title: "Keşfet", desc: "Yakınındaki kuaför, berber ve güzellik salonlarını gör; çalışmalarını ve yorumları incele." },
  { n: "02", icon: ShieldCheck, title: "Karşılaştır", desc: "Şeffaf fiyat listesi ve doğrulanmış yorumlarla sana en uygun salonu seç." },
  { n: "03", icon: CalendarCheck, title: "Randevu al", desc: "Müsait saati seç, saniyeler içinde randevunu oluştur; hatırlatmalarla asla unutma." },
];

const FAQ = [
  { q: "Looea kullanmak ücretsiz mi?", a: "Müşteriler için Looea tamamen ücretsizdir. İşletmeler için tek bir Looea Pro planı vardır, ilk ay ücretsizdir." },
  { q: "Randevumu nasıl iptal ederim?", a: "Randevularım sayfasından ilgili randevunu görüntüleyip tek dokunuşla iptal edebilirsin." },
  { q: "Yorumlar gerçek mi?", a: "Evet. Sadece o işletmeden gerçekten randevu almış ve hizmeti tamamlamış müşteriler yorum yazabilir. Uydurma veya satın alınmış yorum yok." },
  { q: "İşletmemi nasıl kaydederim?", a: "Sağ üstteki \"İşletmeler için\" linkinden işletme kaydına geçip birkaç adımda profilini oluşturabilirsin. İlk ay ücretsiz, kredi kartı gerekmez." },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-app-accent uppercase">
      <span className="h-px w-6 bg-app-accent/50" />
      {children}
    </span>
  );
}

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
    prisma.review.aggregate({ where: { hidden: false }, _avg: { rating: true }, _count: { _all: true } }),
    getCategoriesGrouped(),
  ]);

  const avgRating = reviewAgg._avg.rating ?? 0;
  const reviewCount = reviewAgg._count._all;
  const catGroups = Object.entries(categoriesGrouped);

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
            <Eyebrow>Türkiye&apos;nin randevu platformu</Eyebrow>
            <h1 className={`${type.display} mt-5`}>
              Yakınındaki{" "}
              <span className="font-instrument text-[0.9em] font-normal text-app-accent italic">
                en iyi kuaförü
              </span>{" "}
              bul.
            </h1>
            <p className={`${type.bodyLg} mt-5 max-w-md`}>
              Instagram DM&apos;i ve telefon trafiğini bırak. Çalışmaları gör, fiyatları
              karşılaştır, randevunu saniyeler içinde oluştur.
            </p>

            <div className="mt-8 max-w-xl">
              <HeroSearch />
            </div>

            <dl className="mt-10 flex gap-8">
              {[
                ...(businessCount > 0 ? [[`${businessCount}+`, "Kayıtlı işletme"]] : []),
                ...(reviewCount > 0
                  ? [[avgRating.toFixed(1).replace(".", ","), `${reviewCount}+ yorum`]]
                  : []),
                ["7/24", "Online randevu"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="font-grotesk text-2xl font-bold tracking-tight">{v}</dt>
                  <dd className="text-sm text-muted-foreground">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Ürün mockup kümesi — fotoğrafsız UI */}
          <div className="relative mx-auto hidden h-[420px] w-full max-w-md md:block" aria-hidden>
            <div className="absolute top-2 left-2 rotate-[-4deg]">
              <SalonCardMock />
            </div>
            <div className="absolute right-2 bottom-2 rotate-[3deg]">
              <SlotPickerMock />
            </div>
          </div>
        </div>
      </section>

      {/* ── Güven şeridi ── */}
      <section className="border-y border-border bg-secondary/40">
        <div className={`${layout.container} flex flex-wrap items-center justify-center gap-x-10 gap-y-3 py-5 text-sm`}>
          <span className="flex items-center gap-2 font-medium">
            <Star className="size-4 fill-app-accent text-app-accent" />
            {avgRating > 0 ? `${avgRating.toFixed(1).replace(".", ",")} ortalama puan` : "Doğrulanmış yorumlar"}
          </span>
          <span className="flex items-center gap-2 text-muted-foreground">
            <ShieldCheck className="size-4 text-app-accent" /> Sadece gerçek müşteri yorumları
          </span>
          <span className="flex items-center gap-2 text-muted-foreground">
            <CalendarCheck className="size-4 text-app-accent" /> Anında onaylı randevu
          </span>
        </div>
      </section>

      {/* ── Segment: erkek / kadın iki panel ── */}
      <section className={layout.sectionY}>
        <div className={layout.container}>
          <Reveal>
            <Eyebrow>Sana özel</Eyebrow>
            <h2 className={`${type.h1} mt-4 max-w-2xl`}>
              Erkek ya da kadın,{" "}
              <span className="font-instrument text-[0.9em] font-normal text-app-accent italic">
                doğru yerdesin
              </span>
              .
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {[
              { icon: Scissors, title: "Erkek berberi", desc: "Saç kesimi, sakal tıraşı, cilt bakımı ve daha fazlası.", tags: ["Saç Kesimi", "Sakal Tıraşı", "Ağda"] },
              { icon: Sparkles, title: "Kadın kuaförü", desc: "Kesim, boya, fön, bakım ve tırnak — hepsi tek yerde.", tags: ["Fön", "Boya", "Manikür"] },
            ].map((s, i) => (
              <Reveal key={s.title} delay={i * 80}>
                <Link
                  href="/ara"
                  className="group flex h-full flex-col justify-between gap-8 rounded-2xl bg-card p-7 shadow-e1 ring-1 ring-foreground/[0.06] transition-shadow duration-200 ease-[var(--ease-out-quart)] hover:shadow-e2"
                >
                  <div>
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-app-accent-soft text-app-accent-soft-foreground">
                      <s.icon className="size-6" />
                    </span>
                    <h3 className={`${type.h3} mt-5`}>{s.title}</h3>
                    <p className="mt-2 text-muted-foreground">{s.desc}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {s.tags.map((t) => (
                      <span key={t} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                        {t}
                      </span>
                    ))}
                    <span className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-app-accent">
                      Keşfet <ArrowRight className="size-4 transition-transform duration-200 ease-[var(--ease-out-quart)] group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Kategoriler: bento ── */}
      {catGroups.length > 0 && (
        <section className={`${layout.sectionY} border-t border-border bg-secondary/30`}>
          <div className={layout.container}>
            <Reveal>
              <Eyebrow>Hizmetler</Eyebrow>
              <h2 className={`${type.h1} mt-4 max-w-2xl`}>
                Saçından tırnağına,{" "}
                <span className="font-instrument text-[0.9em] font-normal text-app-accent italic">tek adreste</span>.
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {catGroups.map(([group, categories], i) => {
                const Icon = GROUP_ICONS[group] ?? Sparkles;
                const wide = i === 0;
                return (
                  <Reveal
                    key={group}
                    delay={i * 60}
                    className={wide ? "lg:col-span-2" : ""}
                  >
                    <Link
                      href={`/ara?kategori=${categories[0]?.slug ?? ""}`}
                      className="group flex h-full items-start gap-4 rounded-2xl bg-card p-6 shadow-e1 ring-1 ring-foreground/[0.06] transition-shadow duration-200 ease-[var(--ease-out-quart)] hover:shadow-e2"
                    >
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-app-accent-soft text-app-accent-soft-foreground">
                        <Icon className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-grotesk font-bold">{GROUP_LABELS[group] ?? group}</h3>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {categories.map((c) => c.name).join(" · ")}
                        </p>
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Öne çıkan salonlar (gerçek veri) ── */}
      {featuredBusinesses.length > 0 && (
        <section className={layout.sectionY}>
          <div className={layout.container}>
            <Reveal className="flex items-end justify-between gap-4">
              <div>
                <Eyebrow>Öne çıkanlar</Eyebrow>
                <h2 className={`${type.h1} mt-4`}>Öne çıkan salonlar</h2>
              </div>
              <Link href="/kesfet" className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-app-accent hover:underline sm:inline-flex">
                Tümünü gör <ArrowRight className="size-4" />
              </Link>
            </Reveal>
          </div>
          <div className="mt-10 flex snap-x gap-5 overflow-x-auto px-4 pb-4 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="shrink-0 sm:w-[max(0px,calc((100vw-72rem)/2))]" aria-hidden />
            {featuredBusinesses.map((b) => (
              <div key={b.id} className="w-64 shrink-0 snap-start">
                <ShowcaseCard business={b} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Nasıl çalışır: bağlı zaman çizelgesi ── */}
      <section className={`${layout.sectionY} border-t border-border bg-secondary/30`}>
        <div className={layout.container}>
          <Reveal className="max-w-2xl">
            <Eyebrow>Nasıl çalışır</Eyebrow>
            <h2 className={`${type.h1} mt-4`}>
              Üç adımda{" "}
              <span className="font-instrument text-[0.9em] font-normal text-app-accent italic">randevu senin</span>.
            </h2>
          </Reveal>
          <div className="relative mt-12 grid gap-8 md:grid-cols-3">
            <div aria-hidden className="absolute top-6 right-[16%] left-[16%] hidden h-px bg-border md:block" />
            {HOW_STEPS.map((s, i) => (
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

      {/* ── Yorumlar (gerçek veri), ofset ── */}
      {reviews.length > 0 && (
        <section className={layout.sectionY}>
          <div className={layout.container}>
            <Reveal>
              <Eyebrow>Topluluk</Eyebrow>
              <h2 className={`${type.h1} mt-4 max-w-2xl`}>
                Müşterilerin bıraktığı{" "}
                <span className="font-instrument text-[0.9em] font-normal text-app-accent italic">gerçek</span> yorumlar.
              </h2>
            </Reveal>
            <div className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3">
              {reviews.map((r, i) => (
                <Reveal key={r.id} delay={(i % 3) * 70} className="mb-5 break-inside-avoid">
                  <figure className="rounded-2xl bg-card p-6 shadow-e1 ring-1 ring-foreground/[0.06]">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className={`size-4 ${j < r.rating ? "fill-app-accent text-app-accent" : "text-muted"}`} />
                      ))}
                    </div>
                    <blockquote className="mt-3 text-sm text-foreground/80">&ldquo;{r.comment}&rdquo;</blockquote>
                    <figcaption className="mt-5 flex items-center gap-2.5">
                      <span className="font-grotesk flex size-9 items-center justify-center rounded-full bg-app-accent-soft text-sm font-bold text-app-accent-soft-foreground">
                        {r.customer.name.charAt(0)}
                      </span>
                      <span>
                        <span className="block text-sm font-medium">{r.customer.name}</span>
                        <span className="block text-xs text-muted-foreground">
                          {r.business.name}
                          {r.business.location?.city ? `, ${r.business.location.city}` : ""}
                        </span>
                      </span>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Karşılaştırma ── */}
      <section id="karsilastirma" className={`${layout.sectionY} border-t border-border bg-secondary/30`}>
        <div className={layout.containerNarrow}>
          <Reveal className="text-center">
            <h2 className={`${type.h1} mx-auto max-w-2xl`}>
              Diğerleri defterle çalışır.{" "}
              <span className="font-instrument text-[0.9em] font-normal text-app-accent italic">Looea&apos;da saniyede randevu.</span>
            </h2>
          </Reveal>
          <Reveal className="mt-10 overflow-hidden rounded-2xl bg-card shadow-e1 ring-1 ring-foreground/[0.06]">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-4 text-left font-medium text-muted-foreground"></th>
                  <th className="font-grotesk p-4 text-center text-base font-bold text-app-accent">Looea</th>
                  <th className="p-4 text-center font-medium text-muted-foreground">Instagram DM</th>
                  <th className="p-4 text-center font-medium text-muted-foreground">Telefon / Defter</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr key={row} className={i % 2 === 0 ? "bg-secondary/40" : ""}>
                    <td className="p-4 font-medium">{row}</td>
                    <td className="bg-app-accent-soft/50 p-4 text-center">
                      <Check className="mx-auto size-4.5 text-app-accent" />
                    </td>
                    <td className="p-4 text-center"><X className="mx-auto size-4.5 text-muted-foreground/40" /></td>
                    <td className="p-4 text-center"><X className="mx-auto size-4.5 text-muted-foreground/40" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </div>
      </section>

      {/* ── İşletme bandı ── */}
      <section className="border-t border-border">
        <div className={`${layout.container} py-14`}>
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-secondary/50 px-6 py-8 text-center ring-1 ring-foreground/[0.06] sm:flex-row sm:justify-between sm:text-left">
            <div>
              <h2 className={type.h3}>İşletme misin?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Looea Pro ile takvimini doldur, yeni müşteriler kazan — ilk ay ücretsiz.
              </p>
            </div>
            <a href={proHref("/")} className={`${btn.primary} shrink-0`}>
              İşletme tarafına geç <ArrowRight className="size-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── SSS ── */}
      <section id="sss" className={layout.sectionY}>
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
            Bir sonraki randevun{" "}
            <span className="font-instrument text-[0.9em] font-normal text-app-accent italic">bir dokunuş</span> uzakta.
          </h2>
          <p className="max-w-md text-white/60">
            Yakınındaki en iyi salonları keşfet, saniyeler içinde yerini ayır.
          </p>
          <Link href="/kesfet" className={btn.primary}>
            Kuaför Bul <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
