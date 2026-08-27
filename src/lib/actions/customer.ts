"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getAvailability } from "@/lib/availability";
import { notify } from "@/lib/notifications";
import { parseDateOnly } from "@/lib/date";

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

function ok<T>(data: T): ActionResult<T> {
  return { success: true, data };
}
function err(error: string): ActionResult<never> {
  return { success: false, error };
}

export async function toggleFavorite(businessId: string): Promise<ActionResult<{ favorited: boolean }>> {
  const session = await auth();
  if (!session?.user) return err("Favorilere eklemek için giriş yapmalısınız");

  const existing = await prisma.favorite.findUnique({
    where: { customerId_businessId: { customerId: session.user.id, businessId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    revalidatePath("/hesabim/favoriler");
    return ok({ favorited: false });
  }

  await prisma.favorite.create({ data: { customerId: session.user.id, businessId } });
  revalidatePath("/hesabim/favoriler");
  return ok({ favorited: true });
}

const createAppointmentSchema = z.object({
  businessId: z.string(),
  serviceId: z.string(),
  staffId: z.string().nullable(),
  date: z.string(), // ISO date (yyyy-mm-dd)
  time: z.string(), // HH:mm
});

export async function createAppointment(
  input: z.infer<typeof createAppointmentSchema>,
): Promise<ActionResult<{ appointmentId: string }>> {
  const session = await auth();
  if (!session?.user) return err("Randevu almak için giriş yapmalısınız");

  const parsed = createAppointmentSchema.safeParse(input);
  if (!parsed.success) return err("Geçersiz randevu bilgisi");
  const { businessId, serviceId, staffId, date, time } = parsed.data;

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || service.businessId !== businessId || !service.active) {
    return err("Hizmet bulunamadı");
  }

  const day = parseDateOnly(date);

  const availability = await getAvailability({ businessId, serviceIds: [serviceId], date: day, staffId });
  let resolvedStaffId = staffId;
  const candidate = availability.find((a) => a.slots.includes(time) && (!staffId || a.staffId === staffId));
  if (!candidate) return err("Seçtiğiniz saat artık müsait değil, lütfen başka bir saat seçin");
  resolvedStaffId = candidate.staffId;

  const [h, m] = time.split(":").map(Number);
  const endMinutes = h * 60 + m + service.durationMinutes;
  const endTime = `${Math.floor(endMinutes / 60)
    .toString()
    .padStart(2, "0")}:${(endMinutes % 60).toString().padStart(2, "0")}`;

  const appointment = await prisma.appointment.create({
    data: {
      businessId,
      customerId: session.user.id,
      serviceId,
      staffId: resolvedStaffId,
      date: day,
      startTime: time,
      endTime,
      price: service.price,
      status: "PENDING",
    },
  });

  const business = await prisma.business.findUnique({ where: { id: businessId }, select: { ownerId: true, name: true } });
  if (business) {
    await notify(
      business.ownerId,
      "APPOINTMENT_CREATED",
      "Yeni randevu talebi",
      `${session.user.name} için yeni bir randevu talebi oluşturuldu.`,
    );
  }

  revalidatePath("/hesabim/randevularim");
  return ok({ appointmentId: appointment.id });
}

export async function cancelAppointment(appointmentId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return err("Giriş yapmalısınız");

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { business: { select: { ownerId: true, name: true } } },
  });
  if (!appointment || appointment.customerId !== session.user.id) {
    return err("Randevu bulunamadı");
  }
  if (appointment.status === "COMPLETED" || appointment.status === "CANCELLED") {
    return err("Bu randevu iptal edilemez");
  }

  await prisma.appointment.update({ where: { id: appointmentId }, data: { status: "CANCELLED" } });
  await notify(
    appointment.business.ownerId,
    "APPOINTMENT_CANCELLED",
    "Randevu iptal edildi",
    `${appointment.business.name} için bir randevu müşteri tarafından iptal edildi.`,
  );

  revalidatePath("/hesabim/randevularim");
  return ok(undefined);
}

const reviewSchema = z.object({
  appointmentId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
  photoUrl: z.string().url().optional().or(z.literal("")),
});

export async function submitReview(input: z.infer<typeof reviewSchema>): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return err("Giriş yapmalısınız");

  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return err("Geçersiz değerlendirme");
  const { appointmentId, rating, comment, photoUrl } = parsed.data;

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { review: true },
  });
  if (!appointment || appointment.customerId !== session.user.id) return err("Randevu bulunamadı");
  if (appointment.status !== "COMPLETED") return err("Sadece tamamlanmış randevular değerlendirilebilir");
  if (appointment.review) return err("Bu randevu için zaten bir değerlendirme yaptınız");

  await prisma.review.create({
    data: {
      businessId: appointment.businessId,
      customerId: session.user.id,
      appointmentId,
      rating,
      comment,
      photoUrl: photoUrl || undefined,
    },
  });

  const agg = await prisma.review.aggregate({
    where: { businessId: appointment.businessId, hidden: false },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.business.update({
    where: { id: appointment.businessId },
    data: {
      ratingAvg: Math.round((agg._avg.rating ?? 0) * 10) / 10,
      ratingCount: agg._count,
    },
  });

  revalidatePath("/hesabim/randevularim");
  return ok(undefined);
}

const completeOnboardingSchema = z.object({
  segment: z.enum(["MALE", "FEMALE"]),
  birthDate: z.string().min(1),
  city: z.string().min(1),
  phone: z.string().min(1),
  interests: z.array(z.string()).min(1),
  avatarUrl: z.string().optional(),
});

export async function completeOnboarding(
  input: z.infer<typeof completeOnboardingSchema>,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return err("Giriş yapmalısınız");

  const parsed = completeOnboardingSchema.safeParse(input);
  if (!parsed.success) return err("Geçersiz bilgi");
  const { segment, birthDate, city, phone, interests, avatarUrl } = parsed.data;

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      segment,
      birthDate: new Date(birthDate),
      city,
      phone,
      interests: JSON.stringify(interests),
      avatarUrl: avatarUrl || undefined,
      onboardingCompleted: true,
    },
  });

  revalidatePath("/kesfet");
  revalidatePath("/hesabim");
  return ok(undefined);
}

const updateSegmentSchema = z.object({
  segment: z.enum(["MALE", "FEMALE"]),
});

export async function updateSegment(
  input: z.infer<typeof updateSegmentSchema>,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return err("Giriş yapmalısınız");

  const parsed = updateSegmentSchema.safeParse(input);
  if (!parsed.success) return err("Geçersiz bilgi");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { segment: parsed.data.segment },
  });

  revalidatePath("/kesfet");
  revalidatePath("/ara");
  revalidatePath("/hesabim");
  return ok(undefined);
}

const updateProfileSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
});

export async function updateProfile(input: z.infer<typeof updateProfileSchema>): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return err("Giriş yapmalısınız");

  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) return err("Geçersiz bilgi");

  await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
  });

  revalidatePath("/hesabim");
  return ok(undefined);
}

export async function markNotificationRead(notificationId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return err("Giriş yapmalısınız");

  await prisma.notification.updateMany({
    where: { id: notificationId, userId: session.user.id },
    data: { read: true },
  });

  revalidatePath("/hesabim/bildirimler");
  return ok(undefined);
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return err("Giriş yapmalısınız");

  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });

  revalidatePath("/hesabim/bildirimler");
  return ok(undefined);
}
