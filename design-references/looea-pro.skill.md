---
name: looea-pro-design
description: Looea Pro / işletme paneli (pro.looea.com) + admin tasarım dili — Fady işletme sitesinden (coiffeurs.fady-app.com) çıkarılan yoğun, işlevsel, sakin panel diline dayanır; Looea kimliğiyle (mor #A21CDB, Space Grotesk) harmanlanmıştır. Pro landing, işletme paneli (genel bakış, randevular, takvim, hizmetler, portföy, ayarlar), auth ve admin için.
metadata:
  audience: pro / business / admin
  reference: coiffeurs.fady-app.com
  identity: Looea (#A21CDB · Space Grotesk)
  source_of_truth: src/lib/design-tokens.ts + src/app/globals.css
---

# Looea — Pro / İşletme Paneli Tasarım Dili

> Müşteri tarafıyla **aynı DNA** (aksan #A21CDB, 4px grid, ease-out-quart hareket, aynı token seti),
> ama **daha yoğun, daha işlevsel, daha sakin**. Fady'de de coiffeurs paneli müşteri sitesinden bu yönde
> farklılaşır. Fady'nin morunu/bileşenlerini kopyalama; alınan şey oran, ritim, hiyerarşi ve cila.

## 0. Karakter (tek cümlede)
Serif vurgunun **olmadığı**, sadece Space Grotesk sans ile kurulan; veri yoğun ama nefes alan; morun neredeyse
tamamen aksiyon ve aktif duruma ayrıldığı; düz (ring) ve tek katman gölgeyle sakin kalan işlevsel bir çalışma yüzeyi.

## 1. Müşteri tarafından farkları (Fady'deki farklılaşmayla aynı yön)

| Boyut | Müşteri (looea.com) | **Pro / panel (pro.looea.com)** |
|---|---|---|
| Tipografi | Space Grotesk + Instrument Serif italik vurgu | **Yalnız Space Grotesk** — serif italik yok. Başlıklar `pageTitle` (24px), gövde 14-16. |
| Başlık ölçeği | Büyük, cesur (`display`) | Ölçülü (`pageTitle` / `h3`). Ekranda hakim öğe veri, başlık değil. |
| Yoğunluk | Cömert boşluk (py-20→28) | **Sıkı ama nefes alan.** İç sayfa üst py-8→10, kart içi p-5/p-6, blok arası space-y-6/8. |
| Yükseltme | e1/e2 + yüzen kartlar | Ağırlıkla **düz `card.flat`** (ring-1). Gölge yalnız hover/overlay/popover'da. |
| Yarıçap | Pill hakim, büyük yarıçap | shadcn `<Button>` (rounded-lg) yoğun UI dili; input/kart `rounded-2xl`. |
| Mor kullanımı | Hero vurgu + footer + CTA | **Neredeyse yalnız** birincil aksiyon, aktif nav öğesi, seçili satır/sekme, focus halkası. |
| Kapsayıcı | max-w-6xl odaklı landing | Panel içi tam genişlik + sidebar; içerik sütunu ölçülü. Fady pro 72rem. |

## 2. Renk (Looea — değişmez)
- Zemin `background`, kart `card`, sidebar `sidebar` token'ları.
- Aksan **`app-accent` (#A21CDB)** yalnız: birincil buton, aktif nav, seçili satır/sekme, focus. Tablolarda/rozetlerde dekorasyon değil.
- `app-accent-soft`: seçili satır zemini, aktif nav arka planı, hafif rozet.
- Metin: `foreground` birincil; `muted-foreground` etiket/meta. **Tutarlı ol** — bir yerde siyah bir yerde gri başlık olmasın (denetimde çıkan sorun).
- Durum renkleri randevu/işlem durumları için semantik: `success` (onaylı), `warning` (bekleyen), `destructive` (iptal).

## 3. Tipografi
- **Yalnız Space Grotesk.** `pageTitle` iç sayfa H1; `h3` kart/blok başlığı; `eyebrow` bölüm etiketi; `body`/`small`/`caption`.
- Sayısal veri (fiyat, sayaç, istatistik) `font-grotesk` bold, `foreground`; etiketi `caption` `muted-foreground` uppercase.
- Ekranda 3-4 boyut sınırı; hiyerarşi ağırlık+renkle.

## 4. Şekil, derinlik, hareket
- **Yarıçap:** yoğun UI kontrolleri shadcn `<Button>`/`<Input>` (rounded-lg/xl); kart/input `rounded-2xl`; büyük panel `rounded-[28px]`.
- **Yükseltme:** varsayılan `card.flat` (ring-1 ring-foreground/10). Dropdown/popover/modal `shadow-e2`. Hover'da tablo satırı `bg-muted`, kart `hover:shadow-e2` (yalnız tıklanabilirse).
- **Hareket:** `duration-200 ease-out-quart`. Dropdown/modal fade+scale girişi; accordion yumuşak yükseklik; hepsi tek süre/easing. `prefers-reduced-motion` uyumlu.

## 5. Form & panel bileşenleri (Phase 4 hedefi)
- **Form elemanları:** paylaşılan bileşen; min **44px** yükseklik, üstte etiket, net **focus halkası** (`ring` aksan), anlaşılır hata (alan altında, `destructive`), yardımcı metin. Placeholder etiketin yerine geçmez.
- **Dosya yükleme:** sürükle-bırak alanı (dashed border `rounded-2xl`), önizleme, ilerleme, değiştir/sil, alan içi hata. Boş durumda ikon+açıklama.
- **Auth (Phase 5 ile uyumlu):** Fady pro'daki gibi ortalanmış sütun, kenarlıksız; logo tile → sans bold başlık → muted alt metin → tam genişlik input → büyük pill/lg CTA → "veya" ayraç → **tam genişlik sosyal buton (ikon+etiket ortalı)**. *Not: Fady'de Apple+Google var; Looea'ya yalnız Google eklenir, Apple eklenmez.*
- **Sidebar/nav:** aktif öğe `app-accent-soft` zemin + `app-accent` metin/çubuk; pasif `muted-foreground`.
- **Tablo/liste:** zebra yok; satır ayracı `border`; hover `bg-muted`; durum rozetleri semantik renk + `app-accent-soft` benzeri yumuşak zemin.

## 6. Yapma
- Serif (Instrument) kullanma — pro tarafı sans-only.
- Fady morunu/bileşenlerini kopyalama.
- Üç yüzey (müşteri/pro/admin) arası farklı yazı ağırlığı, boşluk ritmi, buton/form stili bırakma — hepsi tek sisteme hizalı.
- 44px altı dokunma hedefi, focus halkasız input, üstte toplanan hata mesajı, placeholder-etiket bırakma.
- Keyfi boşluk/yarıçap/gölge; backdrop-blur.
