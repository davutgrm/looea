import { z } from "zod";
import { text, optionalText, optionalEmailField, optionalUrlField, optionalPhoneField, idField, boundedArray } from "@/lib/validation/common";
import { businessTypeEnum, roleEnum, categoryGroupEnum, billingPeriodEnum, sortDirectionEnum } from "@/lib/validation/enums";

export const toggleUserActiveSchema = z.object({ userId: idField, active: z.boolean() });
export const changeUserRoleSchema = z.object({ userId: idField, role: roleEnum });

export const toggleBusinessVerifiedSchema = z.object({ businessId: idField });
export const toggleBusinessActiveSchema = z.object({ businessId: idField });
export const deleteBusinessSchema = z.object({ businessId: idField });

export const updateBusinessSchema = z.object({
  businessId: idField,
  name: text(2, 150, "İşletme adı en az 2 karakter olmalı"),
  type: businessTypeEnum,
  phone: optionalPhoneField,
  email: optionalEmailField,
  instagram: optionalText(100),
  website: optionalUrlField,
  description: optionalText(3000),
});

export const categorySchema = z.object({
  name: text(2, 100, "Kategori adı en az 2 karakter olmalı"),
  group: categoryGroupEnum,
  order: z.number().int().min(0).max(10_000),
  active: z.boolean(),
});
export const updateCategorySchema = categorySchema.extend({ id: idField });
export const deleteCategorySchema = z.object({ id: idField });
export const toggleCategoryActiveSchema = z.object({ id: idField });
export const moveCategorySchema = z.object({ id: idField, direction: sortDirectionEnum });

export const toggleReviewHiddenSchema = z.object({ id: idField });
export const deleteReviewSchema = z.object({ id: idField });

export const planSchema = z.object({
  name: text(2, 100, "Plan adı en az 2 karakter olmalı"),
  price: z.number().min(0, "Fiyat 0'dan küçük olamaz").max(1_000_000, "Fiyat çok yüksek"),
  billingPeriod: billingPeriodEnum,
  features: boundedArray(text(1, 200), 50).default([]),
  order: z.number().int().min(0).max(10_000),
  active: z.boolean(),
});
export const updatePlanSchema = planSchema.extend({ id: idField });
export const deletePlanSchema = z.object({ id: idField });
export const togglePlanActiveSchema = z.object({ id: idField });
export const movePlanSchema = z.object({ id: idField, direction: sortDirectionEnum });
