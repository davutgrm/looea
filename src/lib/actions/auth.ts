"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { SERVES_FOR_TYPE } from "@/lib/business-types";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { formatRetryAfter } from "@/lib/rate-limit-config";

const TOO_MANY_REQUESTS = (retryAfterSeconds: number) =>
  `Çok fazla istekte bulundunuz. ${formatRetryAfter(retryAfterSeconds)} sonra tekrar deneyin.`;

const registerCustomerSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalı"),
  email: z.string().email("Geçerli bir email girin"),
  phone: z.string().optional(),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

export type ActionResult = { success: true } | { success: false; error: string };

const forgotPasswordSchema = z.object({
  email: z.string().email("Geçerli bir email girin"),
});

/**
 * Şifre sıfırlama talebi. E-posta gönderimi henüz canlı değil (ödeme sağlayıcısı
 * gibi stub) — hesabın var olup olmadığını sızdırmamak için her durumda nötr
 * başarı döner. SMTP bağlandığında burada token üretilip sıfırlama linki
 * gönderilecek.
 */
export async function requestPasswordReset(input: unknown): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Geçersiz email" };
  }

  // Checked before the DB lookup and keyed the same way regardless of
  // whether the account exists, so this can't be used to enumerate emails.
  const ip = await getClientIp();
  const ipLimit = await checkRateLimit("passwordReset", `ip:${ip}`);
  if (!ipLimit.allowed) return { success: false, error: TOO_MANY_REQUESTS(ipLimit.retryAfterSeconds) };
  const emailLimit = await checkRateLimit("passwordReset", `email:${parsed.data.email.toLowerCase()}`);
  if (!emailLimit.allowed) return { success: false, error: TOO_MANY_REQUESTS(emailLimit.retryAfterSeconds) };

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (user && process.env.NODE_ENV !== "production") {
    // TODO(email): SMTP bağlanınca gerçek sıfırlama linki gönder.
    console.info(`[şifre sıfırlama] ${parsed.data.email} için talep alındı (stub).`);
  }
  return { success: true };
}

export async function registerCustomer(input: unknown): Promise<ActionResult> {
  const ip = await getClientIp();
  const ipLimit = await checkRateLimit("registerCustomer", `ip:${ip}`);
  if (!ipLimit.allowed) return { success: false, error: TOO_MANY_REQUESTS(ipLimit.retryAfterSeconds) };

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
  ownerPhone: z.string().optional(),
  email: z.string().email("Geçerli bir email girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
  businessName: z.string().min(2, "İşletme adı en az 2 karakter olmalı"),
  businessType: businessTypeEnum,
  city: z.string().min(2, "Şehir seçin"),
  district: z.string().min(1, "İlçe seçin"),
  address: z.string().min(5, "Adres en az 5 karakter olmalı"),
  latitude: z.number(),
  longitude: z.number(),
  referralSource: z.string().optional(),
});

export async function registerBusiness(input: unknown): Promise<ActionResult> {
  const ip = await getClientIp();
  const ipLimit = await checkRateLimit("registerBusiness", `ip:${ip}`);
  if (!ipLimit.allowed) return { success: false, error: TOO_MANY_REQUESTS(ipLimit.retryAfterSeconds) };

  const parsed = registerBusinessSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }
  const {
    ownerName,
    ownerPhone,
    email,
    password,
    businessName,
    businessType,
    city,
    district,
    address,
    latitude,
    longitude,
    referralSource,
  } = parsed.data;

  // "Kime hizmet veriyorsunuz?" ayrı sorulmuyor — türden tutarlı biçimde türetilir.
  const serves = SERVES_FOR_TYPE[businessType];

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
      phone: ownerPhone,
      passwordHash,
      role: "BUSINESS_OWNER",
      business: {
        create: {
          name: businessName,
          slug,
          type: businessType,
          serves,
          referralSource,
          location: {
            create: { address, city, district, latitude, longitude },
          },
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

  revalidatePath("/"); // landing's business count/featured list read from Business
  return { success: true };
}
