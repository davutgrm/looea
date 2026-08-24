/** Formats a Date using its local calendar date (not UTC) as "yyyy-mm-dd". */
export function toDateOnlyString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parses a "yyyy-mm-dd" string as local midnight (not UTC midnight), so it
 * round-trips correctly with toDateOnlyString across all timezones. */
export function parseDateOnly(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

const RELATIVE_TIME_FORMATTER = new Intl.RelativeTimeFormat("tr", { numeric: "auto" });
const RELATIVE_TIME_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["week", 60 * 60 * 24 * 7],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
];

/** Formats a past date as a Turkish relative string, e.g. "2 hafta önce". */
export function formatRelativeTime(date: Date): string {
  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  for (const [unit, secondsInUnit] of RELATIVE_TIME_UNITS) {
    if (Math.abs(diffSeconds) >= secondsInUnit) {
      return RELATIVE_TIME_FORMATTER.format(Math.round(diffSeconds / secondsInUnit), unit);
    }
  }
  return "az önce";
}
