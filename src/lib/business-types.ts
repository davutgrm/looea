import type { BusinessType } from "@/generated/prisma/client";

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

export const APPOINTMENT_STATUS_LABELS = {
  PENDING: "Onay Bekliyor",
  CONFIRMED: "Onaylandı",
  COMPLETED: "Tamamlandı",
  CANCELLED: "İptal Edildi",
  NO_SHOW: "Gelmedi",
} as const;
