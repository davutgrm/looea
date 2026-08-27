/** Normalizes a Turkish phone number to "+90XXXXXXXXXX" (10 digits after the
 * country code). Accepts input with or without a leading 0/+90/spaces.
 * Returns null when the input isn't a plausible 10-digit local number. */
export function normalizeTurkishPhone(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("90") && digits.length === 12) digits = digits.slice(2);
  else if (digits.startsWith("0") && digits.length === 11) digits = digits.slice(1);
  if (digits.length !== 10) return null;
  return `+90${digits}`;
}
