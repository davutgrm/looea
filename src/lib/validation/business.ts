import { z } from "zod";
import {
  text,
  optionalText,
  optionalEmailField,
  optionalUrlField,
  urlField,
  phoneField,
  optionalPhoneField,
  latitudeField,
  longitudeField,
  cityField,
  districtField,
  refineCityDistrict,
  dateOnlyField,
  timeField,
  optionalTimeField,
  boundedArray,
  idField,
  optionalIdField,
  nullableIdField,
} from "@/lib/validation/common";
import {
  appointmentStatusEnum,
  paymentMethodEnum,
  blockReasonEnum,
  businessServesEnum,
  sortDirectionEnum,
  availableNowDurationEnum,
} from "@/lib/validation/enums";

const MAX_IDS_PER_REQUEST = 100;

export const updateAppointmentStatusSchema = z.object({
  appointmentId: idField,
  status: appointmentStatusEnum,
});

export const recordAppointmentPaymentSchema = z.object({
  appointmentId: idField,
  paymentMethod: paymentMethodEnum,
});

export const serviceSchema = z.object({
  id: optionalIdField,
  name: text(2, 150, "Hizmet adı en az 2 karakter olmalı"),
  categoryId: idField,
  description: optionalText(2000),
  durationMinutes: z.coerce.number().int().min(5, "Süre en az 5 dakika olmalı").max(600),
  price: z.coerce.number().min(0, "Fiyat 0'dan küçük olamaz").max(1_000_000, "Fiyat çok yüksek"),
  imageUrl: optionalUrlField,
  active: z.boolean().default(true),
  staffIds: boundedArray(idField, MAX_IDS_PER_REQUEST).default([]),
});

export const toggleServiceActiveSchema = z.object({ id: idField, active: z.boolean() });
export const toggleStaffActiveSchema = z.object({ id: idField, active: z.boolean() });

export const businessCustomerSchema = z.object({
  name: optionalText(150),
  phone: phoneField,
  email: optionalEmailField,
});

export const createManualAppointmentSchema = z
  .object({
    customerId: optionalIdField,
    businessCustomerId: optionalIdField,
    serviceIds: boundedArray(idField, 20).min(1, "En az bir hizmet seçin"),
    staffId: nullableIdField,
    date: dateOnlyField,
    time: timeField,
    notes: optionalText(2000),
  })
  .refine((v) => !!v.customerId !== !!v.businessCustomerId, { message: "Müşteri seçilmedi" });

export const staffSchema = z.object({
  id: optionalIdField,
  name: text(2, 100, "İsim en az 2 karakter olmalı"),
  title: optionalText(100),
  avatarUrl: optionalUrlField,
  active: z.boolean().default(true),
  serviceIds: boundedArray(idField, MAX_IDS_PER_REQUEST).default([]),
});

export const setStaffScheduleSchema = z.object({
  staffId: idField,
  blocks: boundedArray(
    z
      .object({
        dayOfWeek: z.number().int().min(0).max(6),
        startTime: timeField,
        endTime: timeField,
      })
      .refine((b) => b.startTime < b.endTime, { message: "Bitiş saati başlangıç saatinden sonra olmalı", path: ["endTime"] }),
    50,
  ),
});

export const addStaffTimeOffSchema = z
  .object({
    staffId: idField,
    startDate: dateOnlyField,
    endDate: dateOnlyField,
    reason: optionalText(500),
  })
  .refine((v) => v.startDate <= v.endDate, { message: "Geçersiz tarih aralığı", path: ["endDate"] });

export const deleteStaffTimeOffSchema = z.object({ id: idField });

export const createBlockedSlotSchema = z
  .object({
    staffId: nullableIdField,
    date: dateOnlyField,
    startTime: timeField,
    endTime: timeField,
    reason: blockReasonEnum,
    label: optionalText(200),
    repeatWeekly: z.boolean().default(false),
  })
  .refine((v) => v.startTime < v.endTime, { message: "Bitiş saati başlangıç saatinden sonra olmalı", path: ["endTime"] });

export const deleteBlockedSlotSchema = z.object({ id: idField });

export const addPortfolioImageSchema = z.object({
  imageUrl: urlField,
  categoryId: optionalIdField,
});
export const deletePortfolioImageSchema = z.object({ id: idField });
export const movePortfolioImageSchema = z.object({ id: idField, direction: sortDirectionEnum });

export const replyToReviewSchema = z.object({
  reviewId: idField,
  reply: text(1, 2000, "Yanıt boş olamaz"),
});

export const changeSubscriptionPlanSchema = z.object({ planId: idField });

export const setAvailableNowSchema = z.object({
  availableNow: z.boolean(),
  duration: availableNowDurationEnum,
});

export const businessProfileSchema = z.object({
  name: text(2, 150, "İşletme adı en az 2 karakter olmalı"),
  description: optionalText(3000),
  logoUrl: optionalUrlField,
  coverImageUrl: optionalUrlField,
  phone: optionalPhoneField,
  email: optionalEmailField,
  instagram: optionalText(100),
  website: optionalUrlField,
  serves: businessServesEnum,
});

export const locationSchema = z
  .object({
    address: text(5, 300, "Adres en az 5 karakter olmalı"),
    city: cityField,
    district: districtField,
    postalCode: optionalText(20),
    latitude: latitudeField,
    longitude: longitudeField,
  })
  .superRefine((v, ctx) => refineCityDistrict(v.city, v.district, ctx));

export const hoursSchema = z.array(
  z
    .object({
      dayOfWeek: z.number().int().min(0).max(6),
      openTime: optionalTimeField,
      closeTime: optionalTimeField,
      isClosed: z.boolean(),
    })
    .refine((h) => h.isClosed || !h.openTime || !h.closeTime || h.openTime < h.closeTime, {
      message: "Kapanış saati açılış saatinden sonra olmalı",
      path: ["closeTime"],
    }),
);
