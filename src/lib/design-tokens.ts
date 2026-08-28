/**
 * KUAFİ TASARIM SİSTEMİ — TEK KAYNAK
 * =================================================================
 * Renk paleti ve fontlar globals.css'te tanımlı; burası ölçek, ritim ve bileşen
 * reçetelerinin tek kaynağıdır. Her sayfa (müşteri, pro, business, admin, auth)
 * bu sisteme uyar. Yeni boyut/renk/gölge uydurma — buradan seç.
 *
 * ── TİPOGRAFİ (Space Grotesk; landing'lerde vurgu için Instrument Serif italik)
 *   token       px (mobil→masaüstü)   weight  line-height   kullanım
 *   display     40 → 60               700     1.05          landing hero
 *   h1          30 → 40               700     1.10          landing bölüm başlığı
 *   h2          24 → 30               700     1.15          alt bölüm başlığı
 *   h3          20                    700     1.30          kart/blok başlığı
 *   page-title  24                    700     1.20          iç sayfa (app) H1
 *   section-lbl 12  uppercase 0.18em  600     1             eyebrow etiketi
 *   body-lg     18                    400     1.60          hero alt metin
 *   body        16                    400     1.60          gövde
 *   small       14                    500     1.50          ikincil / meta
 *   caption     12                    500     1.40          etiket / dipnot
 *
 * ── BOŞLUK RİTMİ (4px tabanlı): 4 8 12 16 24 32 48 64 96
 *   bölüm dikey:   py-20 (80) mobil → py-28 (112) masaüstü
 *   iç sayfa üst:  py-8 (32) → py-10 (40)
 *   kart içi:      p-5 (20) / p-6 (24)
 *   eleman arası:  gap-2/3/4 (8/12/16), blok arası space-y-6/8 (24/32)
 *   container:     max-w-6xl + px-4 (mobil) / px-6
 *
 * ── RENK ROLLERİ (globals.css)
 *   surface=background · elevated=card · border=border
 *   metin: foreground (birincil) · muted-foreground (yalnızca tali bilgi)
 *   aksan=app-accent (#A21CDB) · aksan-soft=app-accent-soft
 *   durum: success · warning · destructive(hata)
 *   AKSAN yalnızca: birincil buton · aktif durum · link · seçili öğe. Dekorasyon DEĞİL.
 *
 * ── YÜKSELTME (max 2 gölge + seviye 0)
 *   0: ring-1 ring-foreground/10 (düz, yoğun UI kartları)
 *   1: shadow-e1 (dinlenen landing kartı)
 *   2: shadow-e2 (hover / overlay / popover)
 *
 * ── KÖŞE YARIÇAPI (max 3 + pill)
 *   sm=rounded-xl (~12px) küçük kontrol/rozet · md=rounded-2xl (~16px) input/kart
 *   lg=rounded-[28px] büyük panel · pill=rounded-full buton & chip
 *
 * ── HAREKET (tek standart)
 *   işlemler: duration-200 ease-[var(--ease-out-quart)]
 *   reveal:   0.55s ease-out-quart, aşağıdan fade+translate, bir kez
 *   prefers-reduced-motion: tüm animasyonlar kapanır (globals.css)
 */

/** Tipografi ölçeği — başlık/gövde sınıf reçeteleri. */
export const type = {
  display:
    "font-grotesk text-[2.5rem] leading-[1.05] font-bold tracking-tight text-balance md:text-6xl",
  h1: "font-grotesk text-3xl leading-[1.1] font-bold tracking-tight text-balance md:text-[2.5rem]",
  h2: "font-grotesk text-2xl leading-[1.15] font-bold tracking-tight text-balance md:text-3xl",
  h3: "font-grotesk text-xl leading-snug font-bold",
  pageTitle: "font-grotesk text-2xl leading-[1.2] font-bold tracking-tight",
  eyebrow:
    "text-xs font-semibold uppercase tracking-[0.18em] text-app-accent",
  bodyLg: "text-lg leading-relaxed text-muted-foreground text-pretty",
  body: "text-base leading-relaxed",
  small: "text-sm",
  caption: "text-xs font-medium",
} as const;

/** Bölüm/kapsayıcı ritmi. */
export const layout = {
  sectionY: "py-20 md:py-28",
  container: "mx-auto w-full max-w-6xl px-4 sm:px-6",
  containerNarrow: "mx-auto w-full max-w-3xl px-4 sm:px-6",
} as const;

/**
 * Buton reçeteleri — landing / auth / onboarding gibi geniş yüzeyler için pill.
 * Birincil buton her yerde AKSAN renklidir (siyah CTA yok). Yoğun panel UI'ında
 * (customer/business/admin) aynı aksan rengiyle shadcn `<Button>` primitifi
 * kullanılır (rounded-lg, sıkışık arayüz dili) — renk rolü ortak, yalnızca
 * boyut/yarıçap bağlama göre değişir.
 */
export const btn = {
  primary:
    "inline-flex items-center justify-center gap-1.5 rounded-full bg-app-accent px-6 py-3 text-sm font-semibold text-app-accent-foreground transition-colors duration-200 ease-[var(--ease-out-quart)] hover:bg-app-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent disabled:pointer-events-none disabled:opacity-50",
  secondary:
    "inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors duration-200 ease-[var(--ease-out-quart)] hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent disabled:pointer-events-none disabled:opacity-50",
  ghost:
    "inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors duration-200 ease-[var(--ease-out-quart)] hover:text-foreground",
} as const;

/** Kart yüzeyleri. */
export const card = {
  base: "rounded-2xl bg-card shadow-e1 ring-1 ring-foreground/[0.06]",
  hover:
    "rounded-2xl bg-card shadow-e1 ring-1 ring-foreground/[0.06] transition-shadow duration-200 ease-[var(--ease-out-quart)] hover:shadow-e2",
  flat: "rounded-2xl bg-card ring-1 ring-foreground/10",
} as const;
