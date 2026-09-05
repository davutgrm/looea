import { z } from "zod";
import { matchProvince, matchDistrict } from "@/lib/turkey-locations";
import { normalizeTurkishPhone } from "@/lib/phone";

/** Every free-text field in this app must go through one of these instead of
 * a bare z.string() — Postgres columns here are all unbounded TEXT, so Zod's
 * .max() is the only length backstop that exists. */
export function text(min: number, max: number, message?: string) {
  return z.string().trim().min(min, message).max(max);
}
/** Nullable because these round-trip through Prisma's nullable String
 * columns — a form pre-filled from `select`ed DB data (or a client passing
 * the field through unchanged) can legitimately submit `null`, not just
 * `undefined`/`""`. Missed on the first pass and caught by testing against
 * a real row before shipping. */
export function optionalText(max: number) {
  return z
    .string()
    .trim()
    .max(max)
    .nullable()
    .optional()
    .or(z.literal(""))
    .transform((v) => v || undefined);
}

export const emailField = z.string().trim().toLowerCase().email("Geçerli bir email girin").max(254);
export const optionalEmailField = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .nullable()
  .optional()
  .or(z.literal(""))
  .refine((v) => !v || z.string().email().safeParse(v).success, "Geçerli bir email girin")
  .transform((v) => v || undefined);

export const urlField = z.string().trim().url("Geçerli bir URL girin").max(2048);
export const optionalUrlField = z
  .string()
  .trim()
  .max(2048)
  .nullable()
  .optional()
  .or(z.literal(""))
  .refine((v) => !v || z.string().url().safeParse(v).success, "Geçerli bir URL girin")
  .transform((v) => v || undefined);

/** bcrypt silently truncates at 72 bytes; capping well below that avoids
 * hashing attacker-supplied multi-MB strings for no security benefit. */
export const passwordField = z.string().min(6, "Şifre en az 6 karakter olmalı").max(72);

export const latitudeField = z.coerce.number().min(-90).max(90);
export const longitudeField = z.coerce.number().min(-180).max(180);

const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;
/** "yyyy-mm-dd", format-checked AND calendar-checked (rejects 2026-02-30)
 * before it ever reaches parseDateOnly — a malformed string used to produce
 * a silent Invalid Date that only failed later, as a raw Prisma/driver
 * error, when written to the DB. */
export const dateOnlyField = z
  .string()
  .regex(DATE_ONLY_RE, "Geçersiz tarih formatı")
  .refine((v) => {
    const [y, m, d] = v.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
  }, "Geçersiz tarih");

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
export const timeField = z.string().regex(TIME_RE, "Geçersiz saat (HH:mm)");
export const optionalTimeField = z.string().regex(TIME_RE, "Geçersiz saat (HH:mm)").nullable();

/** Rejects a birth date that doesn't parse, plus absurd values (future
 * dates, dates before anyone could plausibly be alive) — previously only
 * ran through a bare `new Date(string)` with no isNaN check at all. */
export const birthDateField = z
  .string()
  .regex(DATE_ONLY_RE, "Geçersiz tarih formatı")
  .refine((v) => {
    const date = new Date(v);
    if (Number.isNaN(date.getTime())) return false;
    const year = date.getFullYear();
    return year >= 1900 && date.getTime() <= Date.now();
  }, "Geçersiz doğum tarihi");

export function boundedArray<T extends z.ZodType>(schema: T, max: number) {
  return z.array(schema).max(max);
}

/** cuid()s this app generates are ~25 chars; 50 is a generous cap that still
 * blocks someone stuffing a multi-KB string into an id-shaped field. */
export const idField = z.string().trim().min(1, "Kayıt kimliği gerekli").max(50);
export const optionalIdField = z
  .string()
  .trim()
  .min(1)
  .max(50)
  .nullable()
  .optional()
  .transform((v) => v || undefined);
export const nullableIdField = z.string().trim().min(1).max(50).nullable();

/** Normalizes to "+90XXXXXXXXXX" server-side, rejecting anything that isn't
 * a plausible Turkish number, instead of trusting whatever string arrives
 * (previously some call sites normalized after parsing, some — registerCustomer
 * — didn't at all). */
export const phoneField = z
  .string()
  .trim()
  .max(20)
  .transform((v, ctx) => {
    const normalized = normalizeTurkishPhone(v);
    if (!normalized) {
      ctx.addIssue({ code: "custom", message: "Geçerli bir telefon numarası girin (+90)" });
      return z.NEVER;
    }
    return normalized;
  });

export const optionalPhoneField = z
  .string()
  .trim()
  .max(20)
  .nullable()
  .optional()
  .or(z.literal(""))
  .transform((v, ctx) => {
    if (!v) return undefined;
    const normalized = normalizeTurkishPhone(v);
    if (!normalized) {
      ctx.addIssue({ code: "custom", message: "Geçerli bir telefon numarası girin (+90)" });
      return z.NEVER;
    }
    return normalized;
  });

/** Matches against the real TR_PROVINCES dataset (fuzzy, same matcher the
 * search/discovery pages already use) instead of accepting any string —
 * garbage city/district text otherwise silently breaks location filtering. */
export const cityField = z
  .string()
  .trim()
  .min(1, "İl gerekli")
  .max(100)
  .refine((v) => !!matchProvince(v), "Geçerli bir il seçin");

export const districtField = z.string().trim().min(1, "İlçe gerekli").max(100);

type IssueCtx = { addIssue: (issue: { code: "custom"; message: string; path?: (string | number)[] }) => void };

/** Cross-field city/district check — call inside an object schema's
 * .superRefine((v, ctx) => refineCityDistrict(v.city, v.district, ctx)),
 * since Zod field-level schemas can't see sibling fields on their own. */
export function refineCityDistrict(
  city: string,
  district: string,
  ctx: IssueCtx,
  districtPath: (string | number)[] = ["district"],
) {
  const province = matchProvince(city);
  if (!province || !matchDistrict(province, district)) {
    ctx.addIssue({ code: "custom", message: "Geçerli bir il/ilçe seçin", path: districtPath });
  }
}
