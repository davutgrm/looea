import { normalizeTurkishPhone } from "@/lib/phone";

/** Builds a wa.me deep link with an optional prefilled message. Returns null
 * when the phone number can't be normalized to a valid Turkish number. */
export function buildWhatsAppLink(phone: string, message?: string): string | null {
  const normalized = normalizeTurkishPhone(phone);
  if (!normalized) return null;
  const number = normalized.replace("+", "");
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
