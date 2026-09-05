"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isOwnedByBusiness, requireBusiness } from "@/lib/auth-guard";
import { notify } from "@/lib/notifications";
import { getPaymentProvider } from "@/lib/payments/provider";
import { getAvailability, mergeAnyStaffSlots } from "@/lib/availability";
import { parseDateOnly } from "@/lib/date";
import { getBusinessPath } from "@/lib/business-url";
import {
  updateAppointmentStatusSchema,
  recordAppointmentPaymentSchema,
  serviceSchema,
  toggleServiceActiveSchema,
  toggleStaffActiveSchema,
  businessCustomerSchema,
  createManualAppointmentSchema,
  staffSchema,
  setStaffScheduleSchema,
  addStaffTimeOffSchema,
  deleteStaffTimeOffSchema,
  createBlockedSlotSchema,
  deleteBlockedSlotSchema,
  addPortfolioImageSchema,
  deletePortfolioImageSchema,
  movePortfolioImageSchema,
  replyToReviewSchema,
  changeSubscriptionPlanSchema,
  setAvailableNowSchema,
  businessProfileSchema,
  locationSchema,
  hoursSchema,
} from "@/lib/validation/business";

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

function fail(error: string): { success: false; error: string } {
  return { success: false, error };
}

function firstIssue(error: { issues: { message: string }[] }): string {
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

export async function updateAppointmentStatus(
  appointmentId: string,
  status: string,
): Promise<ActionResult> {
  const { businessId } = await requireBusiness();

  const parsed = updateAppointmentStatusSchema.safeParse({ appointmentId, status });
  if (!parsed.success) return fail(firstIssue(parsed.error));

  const appointment = await prisma.appointment.findUnique({ where: { id: parsed.data.appointmentId } });
  if (!isOwnedByBusiness(appointment, businessId)) {
    return fail("Randevu bulunamadı");
  }

  await prisma.appointment.updateMany({
    where: appointment.groupId ? { groupId: appointment.groupId, businessId } : { id: appointment.id },
    data: { status: parsed.data.status },
  });

  // Manually-created appointments may belong to a walk-in/business customer
  // with no app account — nothing to notify in that case.
  if (appointment.customerId) {
    if (parsed.data.status === "CONFIRMED") {
      await notify(
        appointment.customerId,
        "APPOINTMENT_CONFIRMED",
        "Randevunuz onaylandı",
        `${appointment.startTime} için randevunuz onaylandı.`,
      );
    } else if (parsed.data.status === "CANCELLED") {
      await notify(
        appointment.customerId,
        "APPOINTMENT_CANCELLED",
        "Randevunuz iptal edildi",
        `${appointment.startTime} için randevunuz işletme tarafından iptal edildi.`,
      );
    }
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
    if (!isOwnedByBusiness(existing, businessId)) return fail("Hizmet bulunamadı");
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
  const parsed = toggleServiceActiveSchema.safeParse({ id, active });
  if (!parsed.success) return fail(firstIssue(parsed.error));

  const service = await prisma.service.findUnique({ where: { id: parsed.data.id } });
  if (!isOwnedByBusiness(service, businessId)) return fail("Hizmet bulunamadı");
  await prisma.service.update({ where: { id: service.id }, data: { active: parsed.data.active } });
  revalidatePath("/business/hizmetler");
  return { success: true, data: undefined };
}

// ---------------------------------------------------------------------------
// Business customers (walk-ins + manually-added contacts, no app account)
// ---------------------------------------------------------------------------

/** Creates or updates (by phone) a business-owned customer contact. Used both
 * by the "+ Müşteri Ekle" flow and the manual appointment wizard's "Geçici
 * müşteri" quick-add — neither creates a login-capable User account. */
export async function upsertBusinessCustomer(
  input: unknown,
): Promise<ActionResult<{ id: string; name: string | null; phone: string }>> {
  const { businessId } = await requireBusiness();

  const parsed = businessCustomerSchema.safeParse(input);
  if (!parsed.success) return fail(firstIssue(parsed.error));

  const { phone, name, email } = parsed.data;

  const customer = await prisma.businessCustomer.upsert({
    where: { businessId_phone: { businessId, phone } },
    update: { ...(name ? { name } : {}), ...(email ? { email } : {}) },
    create: { businessId, name: name ?? null, phone, email: email ?? null },
  });

  revalidatePath("/business/musteriler");
  return { success: true, data: { id: customer.id, name: customer.name, phone: customer.phone } };
}

// ---------------------------------------------------------------------------
// Manual appointments (business panel, walk-in / phone bookings)
// ---------------------------------------------------------------------------

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export async function createManualAppointment(
  input: unknown,
): Promise<ActionResult<{ appointmentIds: string[] }>> {
  const { businessId } = await requireBusiness();

  const parsed = createManualAppointmentSchema.safeParse(input);
  if (!parsed.success) return fail(firstIssue(parsed.error));
  const { customerId, businessCustomerId, serviceIds, staffId, date, time, notes } = parsed.data;

  if (customerId) {
    const customer = await prisma.user.findUnique({ where: { id: customerId } });
    if (!customer) return fail("Müşteri bulunamadı");
  } else if (businessCustomerId) {
    const contact = await prisma.businessCustomer.findUnique({ where: { id: businessCustomerId } });
    if (!isOwnedByBusiness(contact, businessId)) return fail("Müşteri bulunamadı");
  }

  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds }, businessId, active: true },
  });
  if (services.length !== serviceIds.length) return fail("Hizmetlerden biri bulunamadı");
  const serviceMap = new Map(services.map((s) => [s.id, s]));
  const orderedServices = serviceIds.map((id) => serviceMap.get(id)!);

  const day = parseDateOnly(date);
  const availability = await getAvailability({ businessId, serviceIds, date: day, staffId });

  let resolvedStaffId: string | null = null;
  if (staffId) {
    const candidate = availability.find((a) => a.staffId === staffId && a.slots.includes(time));
    resolvedStaffId = candidate ? staffId : null;
  } else {
    const merged = mergeAnyStaffSlots(availability);
    resolvedStaffId = merged.find((m) => m.time === time)?.staffId ?? null;
  }
  if (!resolvedStaffId) return fail("Seçilen saat artık müsait değil, lütfen başka bir saat seçin");

  const groupId = orderedServices.length > 1 ? randomUUID() : null;
  const [h, m] = time.split(":").map(Number);
  let cursor = h * 60 + m;

  const rows = orderedServices.map((service) => {
    const startTime = minutesToTime(cursor);
    cursor += service.durationMinutes;
    const endTime = minutesToTime(cursor);
    return {
      businessId,
      customerId: customerId ?? null,
      businessCustomerId: businessCustomerId ?? null,
      serviceId: service.id,
      staffId: resolvedStaffId,
      date: day,
      startTime,
      endTime,
      price: service.price,
      status: "CONFIRMED" as const,
      notes: notes || null,
      groupId,
    };
  });

  const created = await prisma.$transaction(rows.map((data) => prisma.appointment.create({ data })));

  revalidatePath("/business");
  revalidatePath("/business/randevular");
  revalidatePath("/business/takvim");
  revalidatePath("/business/musteriler");
  return { success: true, data: { appointmentIds: created.map((a) => a.id) } };
}

// ---------------------------------------------------------------------------
// Payment records (business's own bookkeeping — not a payment provider)
// ---------------------------------------------------------------------------

export async function recordAppointmentPayment(
  appointmentId: string,
  paymentMethod: string,
): Promise<ActionResult> {
  const { businessId } = await requireBusiness();

  const parsed = recordAppointmentPaymentSchema.safeParse({ appointmentId, paymentMethod });
  if (!parsed.success) return fail(firstIssue(parsed.error));

  const appointment = await prisma.appointment.findUnique({ where: { id: parsed.data.appointmentId } });
  if (!isOwnedByBusiness(appointment, businessId)) return fail("Randevu bulunamadı");

  await prisma.appointment.updateMany({
    where: appointment.groupId ? { groupId: appointment.groupId, businessId } : { id: appointment.id },
    data: { paymentMethod: parsed.data.paymentMethod },
  });

  revalidatePath("/business/randevular");
  revalidatePath("/business/takvim");
  return { success: true, data: undefined };
}

// ---------------------------------------------------------------------------
// Staff
// ---------------------------------------------------------------------------

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
    if (!isOwnedByBusiness(existing, businessId)) return fail("Çalışan bulunamadı");
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
  const parsed = toggleStaffActiveSchema.safeParse({ id, active });
  if (!parsed.success) return fail(firstIssue(parsed.error));

  const staff = await prisma.businessStaff.findUnique({ where: { id: parsed.data.id } });
  if (!isOwnedByBusiness(staff, businessId)) return fail("Çalışan bulunamadı");
  await prisma.businessStaff.update({ where: { id: staff.id }, data: { active: parsed.data.active } });
  revalidatePath("/business/calisanlar");
  return { success: true, data: undefined };
}

export async function setStaffSchedule(staffId: string, blocks: unknown): Promise<ActionResult> {
  const { businessId } = await requireBusiness();

  const parsed = setStaffScheduleSchema.safeParse({ staffId, blocks });
  if (!parsed.success) return fail("Geçersiz çalışma saatleri");

  const staff = await prisma.businessStaff.findUnique({ where: { id: parsed.data.staffId } });
  if (!isOwnedByBusiness(staff, businessId)) return fail("Çalışan bulunamadı");

  await prisma.$transaction([
    prisma.staffSchedule.deleteMany({ where: { staffId: staff.id } }),
    ...(parsed.data.blocks.length > 0
      ? [
          prisma.staffSchedule.createMany({
            data: parsed.data.blocks.map((b) => ({ staffId: staff.id, ...b })),
          }),
        ]
      : []),
  ]);

  revalidatePath("/business/calisanlar");
  return { success: true, data: undefined };
}

export async function addStaffTimeOff(input: unknown): Promise<ActionResult> {
  const { businessId } = await requireBusiness();

  const parsed = addStaffTimeOffSchema.safeParse(input);
  if (!parsed.success) return fail(firstIssue(parsed.error));

  const staff = await prisma.businessStaff.findUnique({ where: { id: parsed.data.staffId } });
  if (!isOwnedByBusiness(staff, businessId)) return fail("Çalışan bulunamadı");

  await prisma.staffTimeOff.create({
    data: {
      staffId: staff.id,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
      reason: parsed.data.reason || null,
    },
  });

  revalidatePath("/business/calisanlar");
  return { success: true, data: undefined };
}

export async function deleteStaffTimeOff(id: string): Promise<ActionResult> {
  const { businessId } = await requireBusiness();

  const parsed = deleteStaffTimeOffSchema.safeParse({ id });
  if (!parsed.success) return fail("Kayıt bulunamadı");

  const timeOff = await prisma.staffTimeOff.findUnique({ where: { id: parsed.data.id }, include: { staff: true } });
  if (!timeOff || !isOwnedByBusiness(timeOff.staff, businessId)) return fail("Kayıt bulunamadı");

  await prisma.staffTimeOff.delete({ where: { id: timeOff.id } });
  revalidatePath("/business/calisanlar");
  return { success: true, data: undefined };
}

// ---------------------------------------------------------------------------
// Blocked slots (time closed to bookings — lunch, training, leave, etc.)
// ---------------------------------------------------------------------------

export async function createBlockedSlot(input: unknown): Promise<ActionResult<{ id: string }>> {
  const { businessId } = await requireBusiness();

  const parsed = createBlockedSlotSchema.safeParse(input);
  if (!parsed.success) return fail(firstIssue(parsed.error));
  const { staffId, date, startTime, endTime, reason, label, repeatWeekly } = parsed.data;

  if (staffId) {
    const staff = await prisma.businessStaff.findUnique({ where: { id: staffId } });
    if (!isOwnedByBusiness(staff, businessId)) return fail("Çalışan bulunamadı");
  }

  const day = parseDateOnly(date);
  const created = await prisma.blockedSlot.create({
    data: {
      businessId,
      staffId: staffId || null,
      date: day,
      dayOfWeek: day.getDay(),
      startTime,
      endTime,
      reason,
      label: label || null,
      repeatWeekly,
    },
  });

  revalidatePath("/business/takvim");
  return { success: true, data: { id: created.id } };
}

export async function deleteBlockedSlot(id: string): Promise<ActionResult> {
  const { businessId } = await requireBusiness();

  const parsed = deleteBlockedSlotSchema.safeParse({ id });
  if (!parsed.success) return fail("Kayıt bulunamadı");

  const block = await prisma.blockedSlot.findUnique({ where: { id: parsed.data.id } });
  if (!isOwnedByBusiness(block, businessId)) return fail("Kayıt bulunamadı");

  await prisma.blockedSlot.delete({ where: { id: block.id } });
  revalidatePath("/business/takvim");
  return { success: true, data: undefined };
}

// ---------------------------------------------------------------------------
// Portfolio
// ---------------------------------------------------------------------------

export async function addPortfolioImage(input: unknown): Promise<ActionResult> {
  const { businessId } = await requireBusiness();

  const parsed = addPortfolioImageSchema.safeParse(input);
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

  const parsed = deletePortfolioImageSchema.safeParse({ id });
  if (!parsed.success) return fail("Görsel bulunamadı");

  const image = await prisma.portfolioImage.findUnique({ where: { id: parsed.data.id } });
  if (!isOwnedByBusiness(image, businessId)) return fail("Görsel bulunamadı");

  await prisma.portfolioImage.delete({ where: { id: image.id } });
  revalidatePath("/business/portfoy");
  return { success: true, data: undefined };
}

export async function movePortfolioImage(
  id: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  const { businessId } = await requireBusiness();

  const parsed = movePortfolioImageSchema.safeParse({ id, direction });
  if (!parsed.success) return fail("Görsel bulunamadı");

  const images = await prisma.portfolioImage.findMany({
    where: { businessId },
    orderBy: { order: "asc" },
  });
  const idx = images.findIndex((i) => i.id === parsed.data.id);
  if (idx === -1) return fail("Görsel bulunamadı");

  const swapIdx = parsed.data.direction === "up" ? idx - 1 : idx + 1;
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

  const parsed = replyToReviewSchema.safeParse({ reviewId, reply });
  if (!parsed.success) return fail(firstIssue(parsed.error));

  const review = await prisma.review.findUnique({ where: { id: parsed.data.reviewId } });
  if (!isOwnedByBusiness(review, businessId)) return fail("Yorum bulunamadı");

  await prisma.review.update({ where: { id: review.id }, data: { ownerReply: parsed.data.reply } });
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

  const parsed = changeSubscriptionPlanSchema.safeParse({ planId });
  if (!parsed.success) return fail("Plan bulunamadı");

  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: parsed.data.planId } });
  if (!plan || !plan.active) return fail("Plan bulunamadı");

  const result = await getPaymentProvider().startSubscriptionCheckout({ businessId, planId: plan.id });

  revalidatePath("/business/uyelik");
  return { success: true, data: { redirectUrl: result.url } };
}

export async function setAvailableNow(
  availableNow: boolean,
  duration?: "1H" | "2H" | "EOD" | null,
): Promise<ActionResult> {
  const { businessId } = await requireBusiness();

  const parsed = setAvailableNowSchema.safeParse({ availableNow, duration });
  if (!parsed.success) return fail("Geçersiz istek");

  let availableNowUntil: Date | null = null;
  if (parsed.data.availableNow) {
    const now = new Date();
    if (parsed.data.duration === "1H") availableNowUntil = new Date(now.getTime() + 60 * 60 * 1000);
    else if (parsed.data.duration === "2H") availableNowUntil = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    else if (parsed.data.duration === "EOD") {
      availableNowUntil = new Date(now);
      availableNowUntil.setHours(23, 59, 59, 999);
    }
  }

  const business = await prisma.business.update({
    where: { id: businessId },
    data: { availableNow: parsed.data.availableNow, availableNowUntil },
    select: { slug: true, location: { select: { city: true, district: true } } },
  });

  revalidatePath("/business");
  revalidatePath("/kesfet");
  revalidatePath("/ara");
  revalidatePath(`/isletme/${business.slug}`);
  revalidatePath(getBusinessPath({ slug: business.slug, city: business.location?.city, district: business.location?.district }));
  return { success: true, data: undefined };
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

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

export async function updateBusinessLocation(input: unknown): Promise<ActionResult> {
  const { businessId } = await requireBusiness();

  const parsed = locationSchema.safeParse(input);
  if (!parsed.success) return fail(firstIssue(parsed.error));

  const { address, city, district, postalCode, latitude, longitude } = parsed.data;

  await prisma.businessLocation.upsert({
    where: { businessId },
    update: { address, city, district, postalCode: postalCode || null, latitude, longitude },
    create: { businessId, address, city, district, postalCode: postalCode || null, latitude, longitude },
  });

  revalidatePath("/business/ayarlar");
  return { success: true, data: undefined };
}

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
