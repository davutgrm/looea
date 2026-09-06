# design-references

Looea tasarım dili referansları. Fady (fady-app.com) bir **referans**, kopyalanacak site değil —
buradan alınan şey **oran, ritim, hiyerarşi ve cila seviyesi**. Renk paleti (#A21CDB) ve font ailesi
(Space Grotesk + Instrument Serif) değişmez; tek doğruluk kaynağı `src/lib/design-tokens.ts` ve
`src/app/globals.css`.

## Dosyalar
- **`looea-customer.skill.md`** — Müşteri tarafı (looea.com) tasarım dili. Referans: `fady-app.com`.
- **`looea-pro.skill.md`** — Pro/işletme paneli + admin (pro.looea.com) tasarım dili. Referans: `coiffeurs.fady-app.com`.
- **`fady-raw/`** — SkillUI'nin ürettiği ham `DESIGN.md` çıktıları (yalnız kaynak/kanıt; doğrudan uygulama için kullanma).
- **`screenshots/`** — Fady'den alınan referans ekran görüntüleri.

## Nasıl üretildi
SkillUI (statik analiz, AI/API yok) ile iki Fady sitesi ayrı ayrı tarandı (`--mode ultra`):
1. `fady-app.com` → müşteri dili (20 renk, 3 font, 8 bileşen, 32 animasyon)
2. `coiffeurs.fady-app.com` → pro dili (giriş duvarı arkasında; çoğunlukla herkese açık login/landing yakalandı: 11 renk, 2 font)

Ham token dökümü + gerçek ekran görüntüleri incelenip Looea'nın mevcut token sistemiyle harmanlandı.

## Ana çıkarım: iki kitle, tek DNA
| | Müşteri | Pro / panel |
|---|---|---|
| Tipografi | Space Grotesk + Instrument Serif italik vurgu | Yalnız Space Grotesk (serif yok) |
| Ölçek | Büyük, cesur | Ölçülü, veri-öncelikli |
| Yoğunluk | Cömert boşluk | Sıkı ama nefes alan |
| Yükseltme | e1/e2 + yüzen kart | Ağırlıkla düz (ring) |
| Mor | Hero vurgu + footer + CTA | Neredeyse yalnız aksiyon/aktif durum |

Aynı aksan + 4px grid + ease-out-quart hareket her iki yüzeyde ortak → aile tutarlılığı.
