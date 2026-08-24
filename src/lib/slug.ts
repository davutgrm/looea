const TR_MAP: Record<string, string> = {
  "ç": "c", "Ç": "c", // ç Ç
  "ğ": "g", "Ğ": "g", // ğ Ğ
  "ı": "i", "I": "i", // ı I
  "İ": "i", // İ
  "ö": "o", "Ö": "o", // ö Ö
  "ş": "s", "Ş": "s", // ş Ş
  "ü": "u", "Ü": "u", // ü Ü
};

export function slugify(input: string): string {
  const normalized = input
    .split("")
    .map((ch) => TR_MAP[ch] ?? ch)
    .join("");

  return normalized
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
