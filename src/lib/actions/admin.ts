"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { requireRole } from "@/lib/auth-guard";
import type { Role } from "@/generated/prisma/client";
import {
  toggleUserActiveSchema,
  changeUserRoleSchema,
  toggleBusinessVerifiedSchema,
  toggleBusinessActiveSchema,
  deleteBusinessSchema,
  updateBusinessSchema,
  categorySchema,
  updateCategorySchema,
  deleteCategorySchema,
  toggleCategoryActiveSchema,
  moveCategorySchema,
  toggleReviewHiddenSchema,
  deleteReviewSchema,
  planSchema,
  updatePlanSchema,
  deletePlanSchema,
  togglePlanActiveSchema,
  movePlanSchema,
} from "@/lib/validation/admin";

export type ActionResult = { success: true } | { success: false; error: string };

function firstIssue(error: { issues: { message: string }[] }): string {
  return error.issues[0]?.message ?? "Geçersiz form";
}

// ---------- Users ----------

export async function toggleUserActive(userId: string, active: boolean): Promise<ActionResult> {
  const admin = await requireRole("ADMIN");

  const parsed = toggleUserActiveSchema.safeParse({ userId, active });
  if (!parsed.success) return { success: false, error: firstIssue(parsed.error) };

  if (parsed.data.userId === admin.id && !parsed.data.active) {
    return { success: false, error: "Kendi hesabınızı pasif hale getiremezsiniz." };
  }

  const target = await prisma.user.findUnique({ where: { id: parsed.data.userId } });
  if (!target) return { success: false, error: "Kullanıcı bulunamadı." };

  if (!parsed.data.active && target.role === "ADMIN") {
    const activeAdmins = await prisma.user.count({ where: { role: "ADMIN", active: true } });
    if (activeAdmins <= 1) {
      return { success: false, error: "Son aktif admin hesabı pasif hale getirilemez." };
    }
  }

  await prisma.user.update({ where: { id: target.id }, data: { active: parsed.data.active } });
  revalidatePath("/admin/kullanicilar");
  return { success: true };
}

export async function changeUserRole(userId: string, role: Role): Promise<ActionResult> {
  const admin = await requireRole("ADMIN");
  const parsed = changeUserRoleSchema.safeParse({ userId, role });
  if (!parsed.success) return { success: false, error: "Geçersiz rol." };

  if (parsed.data.userId === admin.id) {
    return { success: false, error: "Kendi rolünüzü değiştiremezsiniz." };
  }

  const target = await prisma.user.findUnique({ where: { id: parsed.data.userId } });
  if (!target) return { success: false, error: "Kullanıcı bulunamadı." };

  if (target.role === "ADMIN" && parsed.data.role !== "ADMIN") {
    const activeAdmins = await prisma.user.count({ where: { role: "ADMIN", active: true } });
    if (activeAdmins <= 1) {
      return { success: false, error: "Son admin hesabının rolü değiştirilemez." };
    }
  }

  await prisma.user.update({ where: { id: target.id }, data: { role: parsed.data.role } });
  revalidatePath("/admin/kullanicilar");
  return { success: true };
}

// ---------- Businesses ----------

export async function toggleBusinessVerified(businessId: string): Promise<ActionResult> {
  await requireRole("ADMIN");
  const parsed = toggleBusinessVerifiedSchema.safeParse({ businessId });
  if (!parsed.success) return { success: false, error: "İşletme bulunamadı." };

  const business = await prisma.business.findUnique({ where: { id: parsed.data.businessId } });
  if (!business) return { success: false, error: "İşletme bulunamadı." };

  await prisma.business.update({ where: { id: business.id }, data: { verified: !business.verified } });
  revalidatePath("/admin/isletmeler");
  revalidatePath(`/admin/isletmeler/${business.id}`);
  return { success: true };
}

export async function toggleBusinessActive(businessId: string): Promise<ActionResult> {
  await requireRole("ADMIN");
  const parsed = toggleBusinessActiveSchema.safeParse({ businessId });
  if (!parsed.success) return { success: false, error: "İşletme bulunamadı." };

  const business = await prisma.business.findUnique({ where: { id: parsed.data.businessId } });
  if (!business) return { success: false, error: "İşletme bulunamadı." };

  await prisma.business.update({ where: { id: business.id }, data: { active: !business.active } });
  revalidatePath("/admin/isletmeler");
  revalidatePath(`/admin/isletmeler/${business.id}`);
  return { success: true };
}

export async function updateBusiness(input: unknown): Promise<ActionResult> {
  await requireRole("ADMIN");
  const parsed = updateBusinessSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: firstIssue(parsed.error) };
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
  const parsed = deleteBusinessSchema.safeParse({ businessId });
  if (!parsed.success) return { success: false, error: "İşletme silinirken bir hata oluştu." };

  try {
    await prisma.business.delete({ where: { id: parsed.data.businessId } });
  } catch {
    return { success: false, error: "İşletme silinirken bir hata oluştu." };
  }
  revalidatePath("/admin/isletmeler");
  return { success: true };
}

// ---------- Categories ----------

export async function createCategory(input: unknown): Promise<ActionResult> {
  await requireRole("ADMIN");
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: firstIssue(parsed.error) };
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

export async function updateCategory(input: unknown): Promise<ActionResult> {
  await requireRole("ADMIN");
  const parsed = updateCategorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: firstIssue(parsed.error) };
  }
  const { id, name, group, order, active } = parsed.data;

  await prisma.category.update({ where: { id }, data: { name, group, order, active } });
  revalidatePath("/admin/kategoriler");
  return { success: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  await requireRole("ADMIN");
  const parsed = deleteCategorySchema.safeParse({ id });
  if (!parsed.success) return { success: false, error: "Kategori bulunamadı." };

  try {
    await prisma.category.delete({ where: { id: parsed.data.id } });
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
  const parsed = toggleCategoryActiveSchema.safeParse({ id });
  if (!parsed.success) return { success: false, error: "Kategori bulunamadı." };

  const category = await prisma.category.findUnique({ where: { id: parsed.data.id } });
  if (!category) return { success: false, error: "Kategori bulunamadı." };

  await prisma.category.update({ where: { id: category.id }, data: { active: !category.active } });
  revalidatePath("/admin/kategoriler");
  return { success: true };
}

export async function moveCategory(id: string, direction: "up" | "down"): Promise<ActionResult> {
  await requireRole("ADMIN");
  const parsed = moveCategorySchema.safeParse({ id, direction });
  if (!parsed.success) return { success: false, error: "Kategori bulunamadı." };

  const category = await prisma.category.findUnique({ where: { id: parsed.data.id } });
  if (!category) return { success: false, error: "Kategori bulunamadı." };

  const neighbor = await prisma.category.findFirst({
    where: {
      group: category.group,
      order: parsed.data.direction === "up" ? { lt: category.order } : { gt: category.order },
    },
    orderBy: { order: parsed.data.direction === "up" ? "desc" : "asc" },
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
  const parsed = toggleReviewHiddenSchema.safeParse({ id });
  if (!parsed.success) return { success: false, error: "Yorum bulunamadı." };

  const review = await prisma.review.findUnique({ where: { id: parsed.data.id } });
  if (!review) return { success: false, error: "Yorum bulunamadı." };

  await prisma.review.update({ where: { id: review.id }, data: { hidden: !review.hidden } });
  revalidatePath("/admin/yorumlar");
  return { success: true };
}

export async function deleteReview(id: string): Promise<ActionResult> {
  await requireRole("ADMIN");
  const parsed = deleteReviewSchema.safeParse({ id });
  if (!parsed.success) return { success: false, error: "Yorum bulunamadı." };

  await prisma.review.delete({ where: { id: parsed.data.id } });
  revalidatePath("/admin/yorumlar");
  return { success: true };
}

// ---------- Subscription plans ----------

export async function createPlan(input: unknown): Promise<ActionResult> {
  await requireRole("ADMIN");
  const parsed = planSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: firstIssue(parsed.error) };
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

export async function updatePlan(input: unknown): Promise<ActionResult> {
  await requireRole("ADMIN");
  const parsed = updatePlanSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: firstIssue(parsed.error) };
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
  const parsed = deletePlanSchema.safeParse({ id });
  if (!parsed.success) return { success: false, error: "Plan bulunamadı." };

  try {
    await prisma.subscriptionPlan.delete({ where: { id: parsed.data.id } });
  } catch {
    return { success: false, error: "Bu plana bağlı abonelikler olduğu için silinemiyor." };
  }
  revalidatePath("/admin/uyelikler");
  return { success: true };
}

export async function togglePlanActive(id: string): Promise<ActionResult> {
  await requireRole("ADMIN");
  const parsed = togglePlanActiveSchema.safeParse({ id });
  if (!parsed.success) return { success: false, error: "Plan bulunamadı." };

  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: parsed.data.id } });
  if (!plan) return { success: false, error: "Plan bulunamadı." };

  await prisma.subscriptionPlan.update({ where: { id: plan.id }, data: { active: !plan.active } });
  revalidatePath("/admin/uyelikler");
  return { success: true };
}

export async function movePlan(id: string, direction: "up" | "down"): Promise<ActionResult> {
  await requireRole("ADMIN");
  const parsed = movePlanSchema.safeParse({ id, direction });
  if (!parsed.success) return { success: false, error: "Plan bulunamadı." };

  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: parsed.data.id } });
  if (!plan) return { success: false, error: "Plan bulunamadı." };

  const neighbor = await prisma.subscriptionPlan.findFirst({
    where: { order: parsed.data.direction === "up" ? { lt: plan.order } : { gt: plan.order } },
    orderBy: { order: parsed.data.direction === "up" ? "desc" : "asc" },
  });
  if (!neighbor) return { success: true };

  await prisma.$transaction([
    prisma.subscriptionPlan.update({ where: { id: plan.id }, data: { order: neighbor.order } }),
    prisma.subscriptionPlan.update({ where: { id: neighbor.id }, data: { order: plan.order } }),
  ]);
  revalidatePath("/admin/uyelikler");
  return { success: true };
}
