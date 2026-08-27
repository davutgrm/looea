import { prisma } from "@/lib/prisma";

const SLOT_INTERVAL_MINUTES = 15;

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export type StaffAvailability = {
  staffId: string;
  staffName: string;
  slots: string[]; // "HH:mm" start times
};

/** Total duration and eligible staff (must be able to perform every selected
 * service) for a set of services on the same visit. */
async function resolveServiceSet(businessId: string, serviceIds: string[]) {
  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds }, businessId },
    include: { staff: { include: { staff: true } } },
  });
  if (services.length !== serviceIds.length) return null;

  const duration = services.reduce((sum, s) => sum + s.durationMinutes, 0);

  const staffMap = new Map<string, { id: string; name: string; active: boolean }>();
  for (const service of services) {
    for (const s of service.staff) staffMap.set(s.staff.id, s.staff);
  }
  const eligible = [...staffMap.values()].filter((staff) =>
    services.every((service) => service.staff.some((s) => s.staffId === staff.id)),
  );

  return { duration, eligible };
}

export async function getAvailability(params: {
  businessId: string;
  serviceIds: string[];
  date: Date;
  staffId?: string | null;
}): Promise<StaffAvailability[]> {
  const { businessId, serviceIds, date, staffId } = params;
  const day = startOfDay(date);
  const dayOfWeek = day.getDay();

  const [serviceSet, businessHours] = await Promise.all([
    resolveServiceSet(businessId, serviceIds),
    prisma.businessHours.findUnique({
      where: { businessId_dayOfWeek: { businessId, dayOfWeek } },
    }),
  ]);

  if (!serviceSet) return [];
  if (!businessHours || businessHours.isClosed || !businessHours.openTime || !businessHours.closeTime) {
    return [];
  }

  const businessOpen = timeToMinutes(businessHours.openTime);
  const businessClose = timeToMinutes(businessHours.closeTime);
  const duration = serviceSet.duration;

  const eligibleStaff = serviceSet.eligible.filter((s) => s.active && (!staffId || s.id === staffId));

  if (eligibleStaff.length === 0) return [];

  const now = new Date();
  const isToday = day.getTime() === startOfDay(now).getTime();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const results: StaffAvailability[] = [];

  for (const staff of eligibleStaff) {
    const [schedules, timeOff, appointments, blockedSlots] = await Promise.all([
      prisma.staffSchedule.findMany({ where: { staffId: staff.id, dayOfWeek } }),
      prisma.staffTimeOff.findMany({
        where: {
          staffId: staff.id,
          startDate: { lte: day },
          endDate: { gte: day },
        },
      }),
      prisma.appointment.findMany({
        where: {
          staffId: staff.id,
          date: day,
          status: { in: ["PENDING", "CONFIRMED"] },
        },
        select: { startTime: true, endTime: true },
      }),
      prisma.blockedSlot.findMany({
        where: {
          businessId,
          AND: [
            { OR: [{ staffId: staff.id }, { staffId: null }] },
            { OR: [{ repeatWeekly: true, dayOfWeek }, { repeatWeekly: false, date: day }] },
          ],
        },
        select: { startTime: true, endTime: true },
      }),
    ]);

    if (timeOff.length > 0 || schedules.length === 0) {
      results.push({ staffId: staff.id, staffName: staff.name, slots: [] });
      continue;
    }

    const busyIntervals = [...appointments, ...blockedSlots].map((a) => ({
      start: timeToMinutes(a.startTime),
      end: timeToMinutes(a.endTime),
    }));

    const slots: string[] = [];
    for (const shift of schedules) {
      const shiftStart = Math.max(timeToMinutes(shift.startTime), businessOpen);
      const shiftEnd = Math.min(timeToMinutes(shift.endTime), businessClose);

      for (
        let slotStart = shiftStart;
        slotStart + duration <= shiftEnd;
        slotStart += SLOT_INTERVAL_MINUTES
      ) {
        const slotEnd = slotStart + duration;
        if (isToday && slotStart <= nowMinutes) continue;

        const overlaps = busyIntervals.some(
          (b) => slotStart < b.end && slotEnd > b.start,
        );
        if (!overlaps) slots.push(minutesToTime(slotStart));
      }
    }

    results.push({ staffId: staff.id, staffName: staff.name, slots: [...new Set(slots)].sort() });
  }

  return results;
}

/** Merges per-staff slots into a single "farketmez" list: for each start time,
 * picks the first staff member who is free. */
export function mergeAnyStaffSlots(
  availability: StaffAvailability[],
): { time: string; staffId: string }[] {
  const map = new Map<string, string>();
  for (const staff of availability) {
    for (const time of staff.slots) {
      if (!map.has(time)) map.set(time, staff.staffId);
    }
  }
  return [...map.entries()]
    .map(([time, staffId]) => ({ time, staffId }))
    .sort((a, b) => a.time.localeCompare(b.time));
}
