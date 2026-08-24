"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

const registerCustomerSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalı"),
  email: z.string().email("Geçerli bir email girin"),
  phone: z.string().optional(),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

export type ActionResult = { success: true } | { success: false; error: string };

export async function registerCustomer(input: unknown): Promise<ActionResult> {
  const parsed = registerCustomerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }
  const { name, email, phone, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: "Bu email ile kayıtlı bir hesap zaten var" };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, email, phone, passwordHash, role: "CUSTOMER" },
  });

  return { success: true };
}

const businessTypeEnum = z.enum([
  "WOMEN_SALON",
  "MEN_BARBER",
  "UNISEX_SALON",
  "BEAUTY_SALON",
  "NAIL_SALON",
  "MAKEUP_STUDIO",
  "OTHER",
]);

const registerBusinessSchema = z.object({
  ownerName: z.string().min(2, "İsim en az 2 karakter olmalı"),
  email: z.string().email("Geçerli bir email girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
  businessName: z.string().min(2, "İşletme adı en az 2 karakter olmalı"),
  businessType: businessTypeEnum,
});

export async function registerBusiness(input: unknown): Promise<ActionResult> {
  const parsed = registerBusinessSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }
  const { ownerName, email, password, businessName, businessType } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: "Bu email ile kayıtlı bir hesap zaten var" };
  }

  const baseSlug = slugify(businessName) || "isletme";
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.business.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const trialPeriodEnd = new Date();
  trialPeriodEnd.setDate(trialPeriodEnd.getDate() + 30);
  const plan = await prisma.subscriptionPlan.findFirst({
    where: { active: true },
    orderBy: { order: "asc" },
  });

  await prisma.user.create({
    data: {
      name: ownerName,
      email,
      passwordHash,
      role: "BUSINESS_OWNER",
      business: {
        create: {
          name: businessName,
          slug,
          type: businessType,
          hours: {
            create: Array.from({ length: 7 }, (_, dayOfWeek) => ({
              dayOfWeek,
              openTime: dayOfWeek === 0 ? null : "09:00",
              closeTime: dayOfWeek === 0 ? null : "19:00",
              isClosed: dayOfWeek === 0,
            })),
          },
          ...(plan
            ? {
                subscription: {
                  create: {
                    planId: plan.id,
                    status: "TRIAL",
                    currentPeriodEnd: trialPeriodEnd,
                  },
                },
              }
            : {}),
        },
      },
    },
  });

  return { success: true };
}
