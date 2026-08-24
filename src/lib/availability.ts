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

export async function getAvailability(params: {
  businessId: string;
  serviceId: string;
  date: Date;
  staffId?: string | null;
}): Promise<StaffAvailability[]> {
  const { businessId, serviceId, date, staffId } = params;
  const day = startOfDay(date);
  const dayOfWeek = day.getDay();

  const [service, businessHours] = await Promise.all([
    prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        staff: {
          include: { staff: true },
        },
      },
    }),
    prisma.businessHours.findUnique({
      where: { businessId_dayOfWeek: { businessId, dayOfWeek } },
    }),
  ]);

  if (!service || service.businessId !== businessId) return [];
  if (!businessHours || businessHours.isClosed || !businessHours.openTime || !businessHours.closeTime) {
    return [];
  }

  const businessOpen = timeToMinutes(businessHours.openTime);
  const businessClose = timeToMinutes(businessHours.closeTime);
  const duration = service.durationMinutes;

  const eligibleStaff = service.staff
    .map((s) => s.staff)
    .filter((s) => s.active && (!staffId || s.id === staffId));

  if (eligibleStaff.length === 0) return [];

  const now = new Date();
  const isToday = day.getTime() === startOfDay(now).getTime();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const results: StaffAvailability[] = [];

  for (const staff of eligibleStaff) {
    const [schedules, timeOff, appointments] = await Promise.all([
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
    ]);

    if (timeOff.length > 0 || schedules.length === 0) {
      results.push({ staffId: staff.id, staffName: staff.name, slots: [] });
      continue;
    }

    const busyIntervals = appointments.map((a) => ({
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
