# Aşama 3 — Tasarım Denetimi (Looea)

Yöntem: canlı dev server (`localhost:3001`) → Playwright ile gerçek ekran görüntüleri (masaüstü 1440 + mobil 375), + Impeccable `detect` (deterministik anti-pattern tarayıcı, 51 bulgu public sayfalarda), + kod incelemesi. Fady referans dili (`looea-*.skill.md`) ve `design-tokens.ts` ölçüt alındı.

Severite: **P0** kırıtik / **P1** yüksek / **P2** orta / **P3** düşük.

---

## ÖNEMLİ: Denetlenemeyen yüzeyler (veri durumu)
Admin paneli **"Toplam Kullanıcı 3 · Toplam İşletme 0"** gösteriyor. Bağlı veritabanı (`.env` = **production** Supabase) şu an neredeyse boş: 3 kullanıcı (2 müşteri + 1 admin), **0 işletme, 0 işletme sahibi**. Sonuç:
- **İşletme profili** (`/kuafor/...`) ve **randevu sihirbazı** → 404 (yayında işletme yok).
- **Pro/işletme paneli** (`/business/**`) → `studiox@kuafi.app` hesabı bu DB'de yok, giriş başarısız (rate-limit değil).
- Prod DB'yi **seed etmedim** (seed "wipe & reseed" yapar, prod verisini siler) ve prod'a doğrudan sorgu atmadım (kullanıcı sınırı).
- **Bu iki yüzey Aşama 4'te yerel non-prod DB ile veya bir owner hesabıyla ayrıca denetlenmeli.**

## Not: Yanlış pozitif elendi
Her sayfada sol-altta beliren koyu "N" dairesi = **Next.js dev indicator** (dev-only, production'da yok). Bug değil, raporlanmadı.

---

## Kilitli kısıtlarla ÇELİŞEN Impeccable bulguları (DEĞİŞTİRİLMEYECEK)
Impeccable bunları "AI-slop" sayıyor ama Looea'nın bilinçli/kilitli kararları:
- **`ai-color-palette` (mor/violet)** — #A21CDB marka rengi, kilitli. Değişmez.
- **`overused-font` (Space Grotesk / Geist)** — font ailesi kilitli. Değişmez. *(Yan tespit: landing gövde metni `font-sans`=Geist, başlıklar Space Grotesk — mevcut iki-font sistemi, kasıtlı.)*
- **`kicker-above-heading` / `hero-eyebrow-chip`** — Impeccable eyebrow etiketlerini yasaklıyor; ama `eyebrow` Looea design-token'ı ve Fady referansı da numaralı/eyebrow ritmi kullanıyor. **Koru** (istenirse sayısı azaltılabilir, ama kaldırma).
- **`radial-spotlight-glow`** (pro hero) — opsiyonel; istenirse hafifletilir, kaldırma şart değil.

---

## GENELDEN (üç yüzeyi de ilgilendiren)

### P1 — Aksan üzerinde beyaz metin kontrastı 4.4:1 (AA sınırı 4.5:1)
Impeccable: `low-contrast 4.4:1 — #ffffff on #b23eeb`. Birincil butonlarda (14px semibold beyaz metin, aksan zemin) WCAG AA'yı **0.1 farkla** geçemiyor. Palet kilitli olduğundan çözüm: buton metnini büyük-metin eşiğine taşımak (≥18px bold → 3:1 kuralı) **veya** aksan tonunu algılanmayacak kadar koyulaştırmak (L*'yi ~%2 düşür, hue sabit). Karar kullanıcıya bırakılmalı (palet kilidi nedeniyle).

### P2 — Nav öğe ağırlığı tutarsız (kullanıcının "bir yerde siyah bir yerde gri" şikayeti)
Müşteri sol menüsünde **pasif** öğeler kalın/siyah görünüyor; pro dil dosyasına göre pasif nav `muted-foreground` olmalı, aktif olan aksan. Üç yüzeyde tek nav ağırlık sistemi kurulmalı.

### P2 — Üç yüzey arası nav/shell divergansı
Müşteri = beyaz sol menü; Admin = koyu (near-black) sol menü; mobil = alt-nav. Farklı label'lar aynı hedef için: masaüstü "Keşfet & Harita / Randevular" ↔ mobil "Ara / Randevularım". Admin başlığı **"Dashboard"** (İngilizce) diğer her şey Türkçe. → tek dil + tutarlı label + bilinçli shell farkı.

### P2 — Form kontrolleri 44px altında
`src/components/ui/input.tsx` → `h-8` (**32px**). Kullanıcının Aşama-4 hedefi min 44px dokunma alanı. Input/select/textarea paylaşılan bileşende ≥44px'e çıkarılmalı. (İyi haber: mobilde `text-base`=16px, iOS auto-zoom tetiklenmiyor.)

---

## MÜŞTERİ TARAFI (looea.com)

### Landing (`/`) — genel durum İYİ
Fady-esini iyi uyguluyor: lavanta→beyaz hero gradyanı, Space Grotesk + Instrument Serif italik vurgular, yüzen önizleme kartları, numaralı 3 adım, karşılaştırma tablosu, koyu CTA bandı. Mobil temiz, taşma yok.
- **P2 `nested-cards`** — mockup kartları bölüm kartlarının içinde (kart-içinde-kart). Düzleştir (boşluk/tipografi/ayraç ile).
- **P3** — masaüstü hero'da sağ-alt geniş boşluk; hero dikey ritmi biraz boş.

### Keşfet (`/kesfet`) & Ara (`/ara`)
- **P1 (içerik/veri)** — Boş/cold-start durumu çok çorak: masaüstünde ekranın ~%60'ı boş, sadece "Erkek/Kadın" iki dev kart. Cold-start empty-state yeniden tasarlanmalı (Aşama 4 "sıkışıklık/boşluk").
- **P2** — pasif nav siyah (yukarıdaki genel P2).
- **P2 (mobil zoom — kullanıcının bildirdiği bug)** — viewport meta temiz (`user-scalable` kısıtı YOK), yatay taşma 0px, input 16px. Yani bildirilen mobil zoom/scroll sorunu bu sayfaların cold-start halinde tekrar üretilemedi; **en olası kaynak harita sayfalarındaki MapLibre canvas'ın dokunmayı yakalaması** (işletme olmadığı için harita render olmadı). Aşama 4'te harita `touch-action`/gesture ele alınmalı.

### Auth (`/giris`, `/kayit`)
- **P2** — Masaüstünde form sol-merkeze yaslı, kartsız/çapasız, çevresi kocaman boş; bitmemiş görünüyor. Fady'deki gibi ortalanmış temiz sütun/kart olmalı. Mobil iyi.
- **P3 `layout-transition: height`** — height animasyonu (muhtemelen bir geçiş) jank riski; transform/grid-rows tercih.
- (Aşama 5 buraya Google ile giriş ekleyecek — Fady deseni: tam-genişlik, ikon+etiket ortalı, "veya" ayracı.)

### Hesabım (`/hesabim`) — İYİ
Üstte etiketli inputlar, aksan "Kaydet", Erkek/Kadın toggle (`app-accent-soft`), temiz menü listesi, sidebar footer doğru. Küçük: input yüksekliği (genel P2), pasif nav ağırlığı.

---

## PRO TARAFI (pro.looea.com)

### Pro landing (`/pro`) — genel durum İYİ
Müşteri diliyle aynı sistem: "Pro" rozeti, serif italik vurgular, yüzen takvim/istatistik mockupları, 499₺/ay fiyat kartı, koyu CTA. Ama en çok anti-pattern burada:
- **P1** — aksan kontrastı 4.4:1 (genel P1).
- **P2 `cramped-padding`** — özellik listesi / SSS akordeon öğelerinde 0px yatay padding, ayraç çizgisine yapışık metin. ≥12–16px iç boşluk ekle.
- **P2 `nested-cards`** — çoklu kart-içinde-kart (özellik bento + mockup kartları).

### İşletme paneli (`/business/**`) — DENETLENEMEDİ
Yukarıdaki veri durumu (owner hesabı/işletme yok). Aşama 4'te yerel seed veya owner ile denetlenmeli — form/dosya-yükleme/tablo yoğun ekranlar burada, Aşama 4'ün ana hedefi.

---

## ADMIN PANELİ (`/admin`) — genel durum İYİ
Koyu sidebar, temiz istatistik kartları, durum dağılımı bar'ları, "İşletme bulunamadı" boş durumu düzgün, mobilde hamburger + tam-genişlik kartlar. ₺ glyph doğru render.
- **P2** — başlık **"Dashboard"** İngilizce (i18n tutarsızlığı) → "Genel Bakış".
- **P2** — koyu sidebar müşteri beyaz sidebarından ayrışıyor (genel P2 kapsamında; admin için koyu kalabilir ama bilinçli karar olmalı).
- Küçük: input yüksekliği/pasif nav (genel).

---

## Aşama 4 için öncelik sırası
1. **P1** Aksan kontrastı (palet kilidi → kullanıcı kararı gerek).
2. **P2** Paylaşılan form bileşenleri (≥44px, focus halkası, üstte etiket, hata) + dosya yükleme alanı.
3. **P2** Nav ağırlığı + üç-yüzey tutarlılığı + label/dil birliği.
4. **P2** Sıkışıklık: nested-cards düzleştir, cramped-padding, cold-start boşlukları.
5. **P2** Mobil: harita touch-action; auth masaüstü ortalama.
6. **P3** height→transform animasyon; hareket standardı (fade+scale dropdown/modal, accordion).
