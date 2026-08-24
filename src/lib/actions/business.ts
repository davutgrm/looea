"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireBusiness } from "@/lib/auth-guard";
import { notify } from "@/lib/notifications";
import { getPaymentProvider } from "@/lib/payments/provider";

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

function fail(error: string): { success: false; error: string } {
  return { success: false, error };
}

function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Geçersiz form verisi";
}

/** Filters a list of ids down to only those belonging to this business's staff. */
async function filterOwnedStaffIds(businessId: string, staffIds: string[]): Promise<string[]> {
  if (staffIds.length === 0) return [];
  const owned = await prisma.businessStaff.findMany({
    where: { id: { in: staffIds }, businessId },
    select: { id: true },
  });
  return owned.map((s) => s.id);
}

/** Filters a list of ids down to only those belonging to this business's services. */
async function filterOwnedServiceIds(businessId: string, serviceIds: string[]): Promise<string[]> {
  if (serviceIds.length === 0) return [];
  const owned = await prisma.service.findMany({
    where: { id: { in: serviceIds }, businessId },
    select: { id: true },
  });
  return owned.map((s) => s.id);
}

// ---------------------------------------------------------------------------
// Appointments
// ---------------------------------------------------------------------------

const appointmentStatusEnum = z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]);

export async function updateAppointmentStatus(
  appointmentId: string,
  status: string,
): Promise<ActionResult> {
  const { businessId } = await requireBusiness();

  const parsedStatus = appointmentStatusEnum.safeParse(status);
  if (!parsedStatus.success) return fail("Geçersiz randevu durumu");

  const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appointment || appointment.businessId !== businessId) {
    return fail("Randevu bulunamadı");
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: parsedStatus.data },
  });

  if (parsedStatus.data === "CONFIRMED") {
    await notify(
      appointment.customerId,
      "APPOINTMENT_CONFIRMED",
      "Randevunuz onaylandı",
      `${appointment.startTime} için randevunuz onaylandı.`,
    );
  } else if (parsedStatus.data === "CANCELLED") {
    await notify(
      appointment.customerId,
      "APPOINTMENT_CANCELLED",
      "Randevunuz iptal edildi",
      `${appointment.startTime} için randevunuz işletme tarafından iptal edildi.`,
    );
  }

  revalidatePath("/business");
  revalidatePath("/business/randevular");
  revalidatePath("/business/takvim");
  revalidatePath("/business/musteriler");
  return { success: true, data: undefined };
}

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

const serviceSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Hizmet adı en az 2 karakter olmalı"),
  categoryId: z.string().min(1, "Kategori seçin"),
  description: z.string().optional(),
  durationMinutes: z.coerce.number().int().min(5, "Süre en az 5 dakika olmalı").max(600),
  price: z.coerce.number().min(0, "Fiyat 0'dan küçük olamaz"),
  imageUrl: z.string().optional(),
  active: z.boolean().default(true),
  staffIds: z.array(z.string()).default([]),
});

export async function upsertService(input: unknown): Promise<ActionResult<{ id: string }>> {
  const { businessId } = await requireBusiness();

  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) return fail(firstIssue(parsed.error));
  const { id, staffIds, description, imageUrl, ...rest } = parsed.data;

  const ownedStaffIds = await filterOwnedStaffIds(businessId, staffIds);

  const category = await prisma.category.findUnique({ where: { id: rest.categoryId } });
  if (!category) return fail("Kategori bulunamadı");

  const data = {
    ...rest,
    description: description || null,
    imageUrl: imageUrl || null,
  };

  let serviceId = id;
  if (id) {
    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing || existing.businessId !== businessId) return fail("Hizmet bulunamadı");
    await prisma.service.update({
      where: { id },
      data: {
        ...data,
        staff: {
          deleteMany: {},
          create: ownedStaffIds.map((staffId) => ({ staffId })),
        },
      },
    });
  } else {
    const created = await prisma.service.create({
      data: {
        ...data,
        businessId,
        staff: { create: ownedStaffIds.map((staffId) => ({ staffId })) },
      },
    });
    serviceId = created.id;
  }

  revalidatePath("/business/hizmetler");
  revalidatePath("/business/calisanlar");
  return { success: true, data: { id: serviceId! } };
}

export async function toggleServiceActive(id: string, active: boolean): Promise<ActionResult> {
  const { businessId } = await requireBusiness();
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service || service.businessId !== businessId) return fail("Hizmet bulunamadı");
  await prisma.service.update({ where: { id }, data: { active } });
  revalidatePath("/business/hizmetler");
  return { success: true, data: undefined };
}

// ---------------------------------------------------------------------------
// Staff
// ---------------------------------------------------------------------------

const staffSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "İsim en az 2 karakter olmalı"),
  title: z.string().optional(),
  avatarUrl: z.string().optional(),
  active: z.boolean().default(true),
  serviceIds: z.array(z.string()).default([]),
});

export async function upsertStaff(input: unknown): Promise<ActionResult<{ id: string }>> {
  const { businessId } = await requireBusiness();

  const parsed = staffSchema.safeParse(input);
  if (!parsed.success) return fail(firstIssue(parsed.error));
  const { id, serviceIds, title, avatarUrl, ...rest } = parsed.data;

  const ownedServiceIds = await filterOwnedServiceIds(businessId, serviceIds);

  const data = {
    ...rest,
    title: title || null,
    avatarUrl: avatarUrl || null,
  };

  let staffId = id;
  if (id) {
    const existing = await prisma.businessStaff.findUnique({ where: { id } });
    if (!existing || existing.businessId !== businessId) return fail("Çalışan bulunamadı");
    await prisma.businessStaff.update({
      where: { id },
      data: {
        ...data,
        services: {
          deleteMany: {},
          create: ownedServiceIds.map((serviceId) => ({ serviceId })),
        },
      },
    });
  } else {
    const created = await prisma.businessStaff.create({
      data: {
        ...data,
        businessId,
        services: { create: ownedServiceIds.map((serviceId) => ({ serviceId })) },
      },
    });
    staffId = created.id;
  }

  revalidatePath("/business/calisanlar");
  revalidatePath("/business/hizmetler");
  return { success: true, data: { id: staffId! } };
}

export async function toggleStaffActive(id: string, active: boolean): Promise<ActionResult> {
  const { businessId } = await requireBusiness();
  const staff = await prisma.businessStaff.findUnique({ where: { id } });
  if (!staff || staff.businessId !== businessId) return fail("Çalışan bulunamadı");
  await prisma.businessStaff.update({ where: { id }, data: { active } });
  revalidatePath("/business/calisanlar");
  return { success: true, data: undefined };
}

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const scheduleBlockSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(timeRegex, "Geçersiz saat"),
  endTime: z.string().regex(timeRegex, "Geçersiz saat"),
});

export async function setStaffSchedule(staffId: string, blocks: unknown): Promise<ActionResult> {
  const { businessId } = await requireBusiness();

  const parsed = z.array(scheduleBlockSchema).safeParse(blocks);
  if (!parsed.success) return fail("Geçersiz çalışma saatleri");

  const staff = await prisma.businessStaff.findUnique({ where: { id: staffId } });
  if (!staff || staff.businessId !== businessId) return fail("Çalışan bulunamadı");

  for (const block of parsed.data) {
    if (block.startTime >= block.endTime) {
      return fail("Bitiş saati başlangıç saatinden sonra olmalı");
    }
  }

  await prisma.$transaction([
    prisma.staffSchedule.deleteMany({ where: { staffId } }),
    ...(parsed.data.length > 0
      ? [
          prisma.staffSchedule.createMany({
            data: parsed.data.map((b) => ({ staffId, ...b })),
          }),
        ]
      : []),
  ]);

  revalidatePath("/business/calisanlar");
  return { success: true, data: undefined };
}

const timeOffSchema = z.object({
  staffId: z.string().min(1),
  startDate: z.string().min(1, "Başlangıç tarihi gerekli"),
  endDate: z.string().min(1, "Bitiş tarihi gerekli"),
  reason: z.string().optional(),
});

export async function addStaffTimeOff(input: unknown): Promise<ActionResult> {
  const { businessId } = await requireBusiness();

  const parsed = timeOffSchema.safeParse(input);
  if (!parsed.success) return fail(firstIssue(parsed.error));

  const staff = await prisma.businessStaff.findUnique({ where: { id: parsed.data.staffId } });
  if (!staff || staff.businessId !== businessId) return fail("Çalışan bulunamadı");

  const startDate = new Date(parsed.data.startDate);
  const endDate = new Date(parsed.data.endDate);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || startDate > endDate) {
    return fail("Geçersiz tarih aralığı");
  }

  await prisma.staffTimeOff.create({
    data: {
      staffId: parsed.data.staffId,
      startDate,
      endDate,
      reason: parsed.data.reason || null,
    },
  });

  revalidatePath("/business/calisanlar");
  return { success: true, data: undefined };
}

export async function deleteStaffTimeOff(id: string): Promise<ActionResult> {
  const { businessId } = await requireBusiness();

  const timeOff = await prisma.staffTimeOff.findUnique({ where: { id }, include: { staff: true } });
  if (!timeOff || timeOff.staff.businessId !== businessId) return fail("Kayıt bulunamadı");

  await prisma.staffTimeOff.delete({ where: { id } });
  revalidatePath("/business/calisanlar");
  return { success: true, data: undefined };
}

// ---------------------------------------------------------------------------
// Portfolio
// ---------------------------------------------------------------------------

const portfolioSchema = z.object({
  imageUrl: z.string().min(1, "Görsel URL'si gerekli"),
  categoryId: z.string().optional(),
});

export async function addPortfolioImage(input: unknown): Promise<ActionResult> {
  const { businessId } = await requireBusiness();

  const parsed = portfolioSchema.safeParse(input);
  if (!parsed.success) return fail(firstIssue(parsed.error));

  const maxOrder = await prisma.portfolioImage.aggregate({
    where: { businessId },
    _max: { order: true },
  });

  await prisma.portfolioImage.create({
    data: {
      businessId,
      imageUrl: parsed.data.imageUrl,
      categoryId: parsed.data.categoryId || null,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  revalidatePath("/business/portfoy");
  return { success: true, data: undefined };
}

export async function deletePortfolioImage(id: string): Promise<ActionResult> {
  const { businessId } = await requireBusiness();

  const image = await prisma.portfolioImage.findUnique({ where: { id } });
  if (!image || image.businessId !== businessId) return fail("Görsel bulunamadı");

  await prisma.portfolioImage.delete({ where: { id } });
  revalidatePath("/business/portfoy");
  return { success: true, data: undefined };
}

export async function movePortfolioImage(
  id: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  const { businessId } = await requireBusiness();

  const images = await prisma.portfolioImage.findMany({
    where: { businessId },
    orderBy: { order: "asc" },
  });
  const idx = images.findIndex((i) => i.id === id);
  if (idx === -1) return fail("Görsel bulunamadı");

  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= images.length) return { success: true, data: undefined };

  const a = images[idx];
  const b = images[swapIdx];
  await prisma.$transaction([
    prisma.portfolioImage.update({ where: { id: a.id }, data: { order: b.order } }),
    prisma.portfolioImage.update({ where: { id: b.id }, data: { order: a.order } }),
  ]);

  revalidatePath("/business/portfoy");
  return { success: true, data: undefined };
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export async function replyToReview(reviewId: string, reply: string): Promise<ActionResult> {
  const { businessId } = await requireBusiness();

  const parsedReply = z.string().min(1, "Yanıt boş olamaz").max(2000).safeParse(reply);
  if (!parsedReply.success) return fail(firstIssue(parsedReply.error));

  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review || review.businessId !== businessId) return fail("Yorum bulunamadı");

  await prisma.review.update({ where: { id: reviewId }, data: { ownerReply: parsedReply.data } });
  revalidatePath("/business/yorumlar");
  return { success: true, data: undefined };
}

// ---------------------------------------------------------------------------
// Subscription
// ---------------------------------------------------------------------------

export async function changeSubscriptionPlan(
  planId: string,
): Promise<ActionResult<{ redirectUrl: string | null }>> {
  const { businessId } = await requireBusiness();

  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
  if (!plan || !plan.active) return fail("Plan bulunamadı");

  const result = await getPaymentProvider().startSubscriptionCheckout({ businessId, planId });

  revalidatePath("/business/uyelik");
  return { success: true, data: { redirectUrl: result.url } };
}

export async function setAvailableNow(availableNow: boolean): Promise<ActionResult> {
  const { businessId } = await requireBusiness();

  const business = await prisma.business.update({
    where: { id: businessId },
    data: { availableNow },
    select: { slug: true },
  });

  revalidatePath("/business");
  revalidatePath("/kesfet");
  revalidatePath("/ara");
  revalidatePath(`/isletme/${business.slug}`);
  return { success: true, data: undefined };
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

const businessProfileSchema = z.object({
  name: z.string().min(2, "İşletme adı en az 2 karakter olmalı"),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  coverImageUrl: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  instagram: z.string().optional(),
  website: z.string().optional(),
  serves: z.enum(["MEN", "WOMEN", "UNISEX"]),
});

export async function updateBusinessProfile(input: unknown): Promise<ActionResult> {
  const { businessId } = await requireBusiness();

  const parsed = businessProfileSchema.safeParse(input);
  if (!parsed.success) return fail(firstIssue(parsed.error));

  const { name, description, logoUrl, coverImageUrl, phone, email, instagram, website, serves } = parsed.data;

  await prisma.business.update({
    where: { id: businessId },
    data: {
      name,
      description: description || null,
      logoUrl: logoUrl || null,
      coverImageUrl: coverImageUrl || null,
      phone: phone || null,
      email: email || null,
      instagram: instagram || null,
      website: website || null,
      serves,
    },
  });

  revalidatePath("/business/ayarlar");
  revalidatePath("/business");
  revalidatePath("/kesfet");
  revalidatePath("/ara");
  return { success: true, data: undefined };
}

const locationSchema = z.object({
  address: z.string().min(2, "Adres gerekli"),
  city: z.string().min(1, "Şehir gerekli"),
  postalCode: z.string().optional(),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
});

export async function updateBusinessLocation(input: unknown): Promise<ActionResult> {
  const { businessId } = await requireBusiness();

  const parsed = locationSchema.safeParse(input);
  if (!parsed.success) return fail(firstIssue(parsed.error));

  const { address, city, postalCode, latitude, longitude } = parsed.data;

  await prisma.businessLocation.upsert({
    where: { businessId },
    update: { address, city, postalCode: postalCode || null, latitude, longitude },
    create: { businessId, address, city, postalCode: postalCode || null, latitude, longitude },
  });

  revalidatePath("/business/ayarlar");
  return { success: true, data: undefined };
}

const hoursSchema = z.array(
  z.object({
    dayOfWeek: z.number().int().min(0).max(6),
    openTime: z.string().nullable(),
    closeTime: z.string().nullable(),
    isClosed: z.boolean(),
  }),
);

export async function updateBusinessHours(input: unknown): Promise<ActionResult> {
  const { businessId } = await requireBusiness();

  const parsed = hoursSchema.safeParse(input);
  if (!parsed.success) return fail("Geçersiz çalışma saatleri");

  await prisma.$transaction(
    parsed.data.map((h) =>
      prisma.businessHours.upsert({
        where: { businessId_dayOfWeek: { businessId, dayOfWeek: h.dayOfWeek } },
        update: {
          openTime: h.isClosed ? null : h.openTime,
          closeTime: h.isClosed ? null : h.closeTime,
          isClosed: h.isClosed,
        },
        create: {
          businessId,
          dayOfWeek: h.dayOfWeek,
          openTime: h.isClosed ? null : h.openTime,
          closeTime: h.isClosed ? null : h.closeTime,
          isClosed: h.isClosed,
        },
      }),
    ),
  );

  revalidatePath("/business/ayarlar");
  return { success: true, data: undefined };
}
