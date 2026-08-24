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
