import { z } from "zod";
import {
  text,
  optionalUrlField,
  optionalPhoneField,
  phoneField,
  cityField,
  dateOnlyField,
  timeField,
  birthDateField,
  boundedArray,
  idField,
  nullableIdField,
} from "@/lib/validation/common";

const segmentEnum = z.enum(["MALE", "FEMALE"]);

export const toggleFavoriteSchema = z.object({ businessId: idField });

export const createAppointmentSchema = z.object({
  businessId: idField,
  serviceId: idField,
  staffId: nullableIdField,
  date: dateOnlyField,
  time: timeField,
});

export const cancelAppointmentSchema = z.object({ appointmentId: idField });

export const reviewSchema = z.object({
  appointmentId: idField,
  rating: z.number().int().min(1).max(5),
  comment: text(0, 1000).optional(),
  photoUrl: optionalUrlField,
});

export const completeOnboardingSchema = z.object({
  segment: segmentEnum,
  birthDate: birthDateField,
  city: cityField,
  phone: phoneField,
  interests: boundedArray(text(1, 50), 20).min(1, "En az bir ilgi alanı seçin"),
  avatarUrl: optionalUrlField,
});

export const updateSegmentSchema = z.object({ segment: segmentEnum });

export const updateProfileSchema = z.object({
  name: text(2, 100),
  phone: optionalPhoneField,
});

export const markNotificationReadSchema = z.object({ notificationId: idField });
