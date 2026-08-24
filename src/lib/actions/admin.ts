"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { requireRole } from "@/lib/auth-guard";
import type { Role } from "@/generated/prisma/client";

export type ActionResult = { success: true } | { success: false; error: string };

const businessTypeEnum = z.enum([
  "WOMEN_SALON",
  "MEN_BARBER",
  "UNISEX_SALON",
  "BEAUTY_SALON",
  "NAIL_SALON",
  "MAKEUP_STUDIO",
  "OTHER",
]);

const roleEnum = z.enum(["CUSTOMER", "BUSINESS_OWNER", "ADMIN"]);

// ---------- Users ----------

export async function toggleUserActive(userId: string, active: boolean): Promise<ActionResult> {
  const admin = await requireRole("ADMIN");

  if (userId === admin.id && !active) {
    return { success: false, error: "Kendi hesabınızı pasif hale getiremezsiniz." };
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return { success: false, error: "Kullanıcı bulunamadı." };

  if (!active && target.role === "ADMIN") {
    const activeAdmins = await prisma.user.count({ where: { role: "ADMIN", active: true } });
    if (activeAdmins <= 1) {
      return { success: false, error: "Son aktif admin hesabı pasif hale getirilemez." };
    }
  }

  await prisma.user.update({ where: { id: userId }, data: { active } });
  revalidatePath("/admin/kullanicilar");
  return { success: true };
}

export async function changeUserRole(userId: string, role: Role): Promise<ActionResult> {
  const admin = await requireRole("ADMIN");
  const parsed = roleEnum.safeParse(role);
  if (!parsed.success) return { success: false, error: "Geçersiz rol." };

  if (userId === admin.id) {
    return { success: false, error: "Kendi rolünüzü değiştiremezsiniz." };
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return { success: false, error: "Kullanıcı bulunamadı." };

  if (target.role === "ADMIN" && parsed.data !== "ADMIN") {
    const activeAdmins = await prisma.user.count({ where: { role: "ADMIN", active: true } });
    if (activeAdmins <= 1) {
      return { success: false, error: "Son admin hesabının rolü değiştirilemez." };
    }
  }

  await prisma.user.update({ where: { id: userId }, data: { role: parsed.data } });
  revalidatePath("/admin/kullanicilar");
  return { success: true };
}

// ---------- Businesses ----------

export async function toggleBusinessVerified(businessId: string): Promise<ActionResult> {
  await requireRole("ADMIN");
  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business) return { success: false, error: "İşletme bulunamadı." };

  await prisma.business.update({ where: { id: businessId }, data: { verified: !business.verified } });
  revalidatePath("/admin/isletmeler");
  revalidatePath(`/admin/isletmeler/${businessId}`);
  return { success: true };
}

export async function toggleBusinessActive(businessId: string): Promise<ActionResult> {
  await requireRole("ADMIN");
  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business) return { success: false, error: "İşletme bulunamadı." };

  await prisma.business.update({ where: { id: businessId }, data: { active: !business.active } });
  revalidatePath("/admin/isletmeler");
  revalidatePath(`/admin/isletmeler/${businessId}`);
  return { success: true };
}

const updateBusinessSchema = z.object({
  businessId: z.string().min(1),
  name: z.string().min(2, "İşletme adı en az 2 karakter olmalı"),
  type: businessTypeEnum,
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email("Geçerli bir email girin").optional().or(z.literal("")),
  instagram: z.string().optional().or(z.literal("")),
  website: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
});

export async function updateBusiness(input: unknown): Promise<ActionResult> {
  await requireRole("ADMIN");
  const parsed = updateBusinessSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }
  const { businessId, name, type, phone, email, instagram, website, description } = parsed.data;

  await prisma.business.update({
    where: { id: businessId },
    data: {
      name,
      type,
      phone: phone || null,
      email: email || null,
      instagram: instagram || null,
      website: website || null,
      description: description || null,
    },
  });

  revalidatePath("/admin/isletmeler");
  revalidatePath(`/admin/isletmeler/${businessId}`);
  return { success: true };
}

export async function deleteBusiness(businessId: string): Promise<ActionResult> {
  await requireRole("ADMIN");
  try {
    await prisma.business.delete({ where: { id: businessId } });
  } catch {
    return { success: false, error: "İşletme silinirken bir hata oluştu." };
  }
  revalidatePath("/admin/isletmeler");
  return { success: true };
}

// ---------- Categories ----------

const categoryGroupEnum = z.enum(["SAC", "GUZELLIK", "TIRNAK", "OZEL"]);

const categorySchema = z.object({
  name: z.string().min(2, "Kategori adı en az 2 karakter olmalı"),
  group: categoryGroupEnum,
  order: z.number().int(),
  active: z.boolean(),
});

export async function createCategory(input: unknown): Promise<ActionResult> {
  await requireRole("ADMIN");
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }
  const { name, group, order, active } = parsed.data;

  const baseSlug = slugify(name) || "kategori";
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.category.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  await prisma.category.create({ data: { name, slug, group, order, active } });
  revalidatePath("/admin/kategoriler");
  return { success: true };
}

const updateCategorySchema = categorySchema.extend({ id: z.string().min(1) });

export async function updateCategory(input: unknown): Promise<ActionResult> {
  await requireRole("ADMIN");
  const parsed = updateCategorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }
  const { id, name, group, order, active } = parsed.data;

  await prisma.category.update({ where: { id }, data: { name, group, order, active } });
  revalidatePath("/admin/kategoriler");
  return { success: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  await requireRole("ADMIN");
  try {
    await prisma.category.delete({ where: { id } });
  } catch {
    return {
      success: false,
      error: "Bu kategoriye bağlı hizmetler olduğu için silinemiyor. Önce pasif hale getirin.",
    };
  }
  revalidatePath("/admin/kategoriler");
  return { success: true };
}

export async function toggleCategoryActive(id: string): Promise<ActionResult> {
  await requireRole("ADMIN");
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) return { success: false, error: "Kategori bulunamadı." };

  await prisma.category.update({ where: { id }, data: { active: !category.active } });
  revalidatePath("/admin/kategoriler");
  return { success: true };
}

export async function moveCategory(id: string, direction: "up" | "down"): Promise<ActionResult> {
  await requireRole("ADMIN");
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) return { success: false, error: "Kategori bulunamadı." };

  const neighbor = await prisma.category.findFirst({
    where: {
      group: category.group,
      order: direction === "up" ? { lt: category.order } : { gt: category.order },
    },
    orderBy: { order: direction === "up" ? "desc" : "asc" },
  });
  if (!neighbor) return { success: true };

  await prisma.$transaction([
    prisma.category.update({ where: { id: category.id }, data: { order: neighbor.order } }),
    prisma.category.update({ where: { id: neighbor.id }, data: { order: category.order } }),
  ]);
  revalidatePath("/admin/kategoriler");
  return { success: true };
}

// ---------- Reviews ----------

export async function toggleReviewHidden(id: string): Promise<ActionResult> {
  await requireRole("ADMIN");
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) return { success: false, error: "Yorum bulunamadı." };

  await prisma.review.update({ where: { id }, data: { hidden: !review.hidden } });
  revalidatePath("/admin/yorumlar");
  return { success: true };
}

export async function deleteReview(id: string): Promise<ActionResult> {
  await requireRole("ADMIN");
  await prisma.review.delete({ where: { id } });
  revalidatePath("/admin/yorumlar");
  return { success: true };
}

// ---------- Subscription plans ----------

const billingPeriodEnum = z.enum(["MONTHLY", "YEARLY"]);

const planSchema = z.object({
  name: z.string().min(2, "Plan adı en az 2 karakter olmalı"),
  price: z.number().min(0, "Fiyat 0'dan küçük olamaz"),
  billingPeriod: billingPeriodEnum,
  features: z.array(z.string().min(1)).default([]),
  order: z.number().int(),
  active: z.boolean(),
});

export async function createPlan(input: unknown): Promise<ActionResult> {
  await requireRole("ADMIN");
  const parsed = planSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }
  const { name, price, billingPeriod, features, order, active } = parsed.data;

  const baseSlug = slugify(name) || "plan";
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.subscriptionPlan.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  await prisma.subscriptionPlan.create({
    data: { name, slug, price, billingPeriod, features: JSON.stringify(features), order, active },
  });
  revalidatePath("/admin/uyelikler");
  return { success: true };
}

const updatePlanSchema = planSchema.extend({ id: z.string().min(1) });

export async function updatePlan(input: unknown): Promise<ActionResult> {
  await requireRole("ADMIN");
  const parsed = updatePlanSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }
  const { id, name, price, billingPeriod, features, order, active } = parsed.data;

  await prisma.subscriptionPlan.update({
    where: { id },
    data: { name, price, billingPeriod, features: JSON.stringify(features), order, active },
  });
  revalidatePath("/admin/uyelikler");
  return { success: true };
}

export async function deletePlan(id: string): Promise<ActionResult> {
  await requireRole("ADMIN");
  try {
    await prisma.subscriptionPlan.delete({ where: { id } });
  } catch {
    return { success: false, error: "Bu plana bağlı abonelikler olduğu için silinemiyor." };
  }
  revalidatePath("/admin/uyelikler");
  return { success: true };
}

export async function togglePlanActive(id: string): Promise<ActionResult> {
  await requireRole("ADMIN");
  const plan = await prisma.subscriptionPlan.findUnique({ where: { id } });
  if (!plan) return { success: false, error: "Plan bulunamadı." };

  await prisma.subscriptionPlan.update({ where: { id }, data: { active: !plan.active } });
  revalidatePath("/admin/uyelikler");
  return { success: true };
}

export async function movePlan(id: string, direction: "up" | "down"): Promise<ActionResult> {
  await requireRole("ADMIN");
  const plan = await prisma.subscriptionPlan.findUnique({ where: { id } });
  if (!plan) return { success: false, error: "Plan bulunamadı." };

  const neighbor = await prisma.subscriptionPlan.findFirst({
    where: { order: direction === "up" ? { lt: plan.order } : { gt: plan.order } },
    orderBy: { order: direction === "up" ? "desc" : "asc" },
  });
  if (!neighbor) return { success: true };

  await prisma.$transaction([
    prisma.subscriptionPlan.update({ where: { id: plan.id }, data: { order: neighbor.order } }),
    prisma.subscriptionPlan.update({ where: { id: neighbor.id }, data: { order: plan.order } }),
  ]);
  revalidatePath("/admin/uyelikler");
  return { success: true };
}
