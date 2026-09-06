---
name: looea-customer-design
description: Looea müşteri tarafı (looea.com) tasarım dili — Fady müşteri sitesinden (fady-app.com) çıkarılan oran, ritim, hiyerarşi ve cila seviyesinin Looea kimliğiyle (mor #A21CDB, Space Grotesk + Instrument Serif) harmanlanmış hali. Landing, keşfet, arama, işletme profili, randevu akışı ve hesap sayfaları için.
metadata:
  audience: customer
  reference: fady-app.com
  identity: Looea (#A21CDB · Space Grotesk · Instrument Serif italic)
  source_of_truth: src/lib/design-tokens.ts + src/app/globals.css
---

# Looea — Müşteri Tarafı Tasarım Dili

> **Bu Fady'nin kopyası DEĞİL.** Fady'den alınan tek şey **oran, ritim, hiyerarşi ve cila seviyesi**.
> Renk, font ve componentler Looea'nın kendi token sisteminden gelir. Fady'nin morunu (#bc31fc / #d4a5ff)
> veya birebir bileşenlerini asla kullanma. Tek doğruluk kaynağı `src/lib/design-tokens.ts` ve `globals.css`.

## 0. Karakter (tek cümlede)
Sıcak, davetkâr, nefes alan bir açık tema; içeriğin öne çıktığı geniş beyaz alan; morun **az ama kararlı**
kullanıldığı; büyük başlıklarda **sans (Space Grotesk) + serif italik (Instrument Serif) kontrastının** duygu
kattığı; yumuşak yükselen kartlar ve zarif hareketle "premium ama ulaşılabilir" hisseden bir yüzey.

## 1. Fady'den öğrenilen oran & ritim (Looea token'larına çevrilmiş)

| Fady'de gözlemlenen | Looea'da karşılığı (kullan) |
|---|---|
| Hero H1 ~96px (6rem), çok büyük | `type.display` (40→60px). Fady kadar dev değil ama **cesur**; hero'da tek hakim öğe olsun. |
| Serif italik vurgu ("ou à domicile") | Hero başlığında 1 kelime/ibareyi `font-instrument italic` ile ver — Looea'nın imza kontrastı. Başlığın tamamını serif yapma. |
| Yumuşak lavanta→beyaz gradyan hero fonu | `bg-app-accent-soft`'tan beyaza çok hafif geçiş. Doygun mor bloklar değil. |
| Tek "gürültülü" mor an: alt footer | Looea'da da güçlü mor **yalnızca bir bölgede** (footer ya da tek CTA bandı). Her yerde değil. |
| Numaralı özellik bölümleri (dev "01" serif rakam + küçük eyebrow) | `type.eyebrow` + büyük `font-instrument` rakam + `type.h2` başlık. Sıralı akışta ritim yaratır. |
| Serbest yüzen önizleme kartı (yumuşak e2 gölge) | `card.hover` / `shadow-e2` ile içeriğin yanında "yüzen" gerçek uygulama önizlemesi. |
| Bol dikey boşluk | `layout.sectionY` (py-20→py-28). Bölümler arası **cömert**; sıkıştırma. |

## 2. Renk (Looea — değişmez)
- Zemin `background` (neredeyse beyaz), yüzey `card`, ayraç `border`.
- Aksan **`app-accent` (#A21CDB)** yalnızca: birincil CTA, aktif durum, link, seçili öğe, tek hero vurgusu. **Dekorasyon değil.**
- Yumuşak aksan `app-accent-soft` sadece: hero fon geçişi, seçili chip zemini, rozet.
- Metin: `foreground` birincil; `muted-foreground` yalnızca tali bilgi (asla gövde metnini griye boğma).
- Durum: `success` / `warning` / `destructive`.

## 3. Tipografi
- Aile: **Space Grotesk** (`font-grotesk`) başlık+UI; **Instrument Serif italic** (`font-instrument`) yalnız duygusal vurgu.
- Ölçek `design-tokens.ts`'ten: `display / h1 / h2 / h3 / bodyLg / body / small / caption`.
- Ekranda en fazla 3-4 boyut. İkincil hiyerarşiyi renk/opaklıkla ver, yeni boyutla değil.
- `text-balance` başlıklarda, `text-pretty` uzun paragraflarda.

## 4. Şekil, derinlik, hareket
- **Yarıçap:** kontrol/rozet `rounded-xl`(~12), input/kart `rounded-2xl`(~16), büyük panel `rounded-[28px]`, buton & chip `rounded-full` (pill). Landing'de pill hakim.
- **Yükseltme:** dinlenen kart `shadow-e1`; hover/yüzen/overlay `shadow-e2`. En fazla 2 gölge + düz (ring) seviye. Fady gibi mor-tonlu gölge **kullanma** — nötr `shadow-e1/e2`.
- **Hareket:** işlemler `duration-200 ease-[var(--ease-out-quart)]`. Bölüm girişleri `Reveal` bileşeni (0.55s, aşağıdan fade+translate, bir kez). Kart hover'ında `hover:shadow-e2` ile hafif yükselme. `prefers-reduced-motion` globals.css'te kapatıyor — yeni animasyonlar da buna uymalı.

## 5. Bileşen reçeteleri (kullan)
- **Buton:** `btn.primary` (pill, aksan), `btn.secondary` (pill, border), `btn.ghost`. Landing/auth/onboarding'de pill.
- **Kart:** `card.base` (dinlenen), `card.hover` (etkileşimli). İçerik p-5/p-6.
- **Arama/hero kontrol çubuğu:** Fady'deki gibi tek satırda segmentli pill konteyner; içinde input + aksan pill "Ara" butonu.
- **Kapsayıcı:** `layout.container` (max-w-6xl). Fady 80rem; Looea 6xl (72rem) — daha odaklı.

## 6. Yapma
- Fady morunu, fontlarını, birebir bileşenlerini kopyalama.
- Aksanı dekorasyon olarak serpme; mor "her yerde" olmasın.
- Gövde metnini `muted-foreground` ile griye boğma.
- Keyfi boşluk/yarıçap/gölge uydurma — hep token'dan seç.
- backdrop-blur/blur kullanma (Fady de kullanmıyor; sistemde yok).
