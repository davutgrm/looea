export const DAY_LABELS = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

type HoursRow = { dayOfWeek: number; openTime: string | null; closeTime: string | null; isClosed: boolean };

export function isOpenNow(hours: HoursRow[]): boolean {
  const now = new Date();
  const today = hours.find((h) => h.dayOfWeek === now.getDay());
  if (!today || today.isClosed || !today.openTime || !today.closeTime) return false;

  const [oh, om] = today.openTime.split(":").map(Number);
  const [ch, cm] = today.closeTime.split(":").map(Number);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return nowMinutes >= oh * 60 + om && nowMinutes <= ch * 60 + cm;
}

export function sortedWeek<T extends HoursRow>(hours: T[]): T[] {
  return [...hours].sort((a, b) => {
    const na = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
    const nb = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
    return na - nb;
  });
}
