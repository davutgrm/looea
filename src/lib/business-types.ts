import type { BusinessType, BusinessServes } from "@/generated/prisma/client";

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  WOMEN_SALON: "Kadın Kuaförü",
  MEN_BARBER: "Erkek Berber",
  UNISEX_SALON: "Unisex Kuaför",
  BEAUTY_SALON: "Güzellik Salonu",
  NAIL_SALON: "Nail Salon",
  MAKEUP_STUDIO: "Makyaj Stüdyosu",
  OTHER: "Diğer",
};

export const BUSINESS_TYPE_OPTIONS = Object.entries(BUSINESS_TYPE_LABELS).map(
  ([value, label]) => ({ value: value as BusinessType, label }),
);

export const BUSINESS_SERVES_LABELS: Record<BusinessServes, string> = {
  MEN: "Erkeklere",
  WOMEN: "Kadınlara",
  UNISEX: "Her ikisine (Unisex)",
};

/** Kime hizmet verildiği artık ayrı sorulmaz — işletme türünden türetilir.
 * "Kime hizmet veriyorsunuz?" ile "İşletme türü" sorularının çakışmasını önler:
 * tek soru (tür) sorulur, `serves` buradan tutarlı biçimde belirlenir. */
export const SERVES_FOR_TYPE: Record<BusinessType, BusinessServes> = {
  MEN_BARBER: "MEN",
  WOMEN_SALON: "WOMEN",
  UNISEX_SALON: "UNISEX",
  BEAUTY_SALON: "UNISEX",
  NAIL_SALON: "UNISEX",
  MAKEUP_STUDIO: "WOMEN",
  OTHER: "UNISEX",
};

/** Onboarding'de tek soruluk "İşletme türü" adımının seçenekleri.
 * Berber/kuaför/güzellik salonlarının hepsini kapsar; "berber" odaklı değil. */
export const BUSINESS_KIND_OPTIONS: {
  value: BusinessType;
  label: string;
  description: string;
}[] = [
  { value: "MEN_BARBER", label: "Erkek Berberi", description: "Saç, sakal ve bakım" },
  { value: "WOMEN_SALON", label: "Kadın Kuaförü", description: "Kesim, renk ve bakım" },
  { value: "UNISEX_SALON", label: "Unisex Kuaför", description: "Kadın ve erkek, herkese" },
  { value: "BEAUTY_SALON", label: "Güzellik Salonu", description: "Cilt, ağda ve bakım" },
  { value: "NAIL_SALON", label: "Tırnak Stüdyosu", description: "Manikür ve protez tırnak" },
  { value: "MAKEUP_STUDIO", label: "Makyaj Stüdyosu", description: "Makyaj ve saç tasarımı" },
  { value: "OTHER", label: "Diğer", description: "Farklı bir güzellik hizmeti" },
];

export const REFERRAL_SOURCE_OPTIONS = [
  "Google araması",
  "Instagram / sosyal medya",
  "Bir tanıdığım önerdi",
  "Kuafi'yi müşteri olarak kullanıyorum",
  "Diğer",
] as const;

/** Businesses/categories visible to a customer of this segment (always includes UNISEX).
 * Returns null when the segment is unknown (logged-out / not yet onboarded) — meaning no filter. */
export function servesForSegment(segment: "MALE" | "FEMALE" | null | undefined): BusinessServes[] | null {
  if (segment === "MALE") return ["MEN", "UNISEX"];
  if (segment === "FEMALE") return ["WOMEN", "UNISEX"];
  return null;
}

export const APPOINTMENT_STATUS_LABELS = {
  PENDING: "Onay Bekliyor",
  CONFIRMED: "Onaylandı",
  COMPLETED: "Tamamlandı",
  CANCELLED: "İptal Edildi",
  NO_SHOW: "Gelmedi",
} as const;
