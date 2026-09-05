import { z } from "zod";

/** Mirrors prisma/schema.prisma's enums — keep in sync if the schema changes. */
export const roleEnum = z.enum(["CUSTOMER", "BUSINESS_OWNER", "ADMIN"]);
export const businessTypeEnum = z.enum([
  "WOMEN_SALON",
  "MEN_BARBER",
  "UNISEX_SALON",
  "BEAUTY_SALON",
  "NAIL_SALON",
  "MAKEUP_STUDIO",
  "OTHER",
]);
export const businessServesEnum = z.enum(["MEN", "WOMEN", "UNISEX"]);
export const appointmentStatusEnum = z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]);
export const paymentMethodEnum = z.enum(["CASH", "CARD", "UNPAID"]);
export const blockReasonEnum = z.enum(["LUNCH", "TRAINING", "LEAVE", "EXTERNAL", "CUSTOM"]);
export const categoryGroupEnum = z.enum(["SAC", "GUZELLIK", "TIRNAK", "OZEL"]);
export const billingPeriodEnum = z.enum(["MONTHLY", "YEARLY"]);
export const sortDirectionEnum = z.enum(["up", "down"]);
export const availableNowDurationEnum = z.enum(["1H", "2H", "EOD"]).nullable().optional();
