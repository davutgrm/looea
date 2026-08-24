"use client";

import { Input } from "@/components/ui/input";

export type BirthDateValue = { day: string; month: string; year: string };

export function isValidBirthDate({ day, month, year }: BirthDateValue): boolean {
  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  if (!d || !m || !y) return false;
  if (d < 1 || d > 31 || m < 1 || m > 12) return false;
  const currentYear = new Date().getFullYear();
  if (y < currentYear - 100 || y > currentYear - 10) return false;
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

function digitsOnly(value: string, maxLength: number) {
  return value.replace(/\D/g, "").slice(0, maxLength);
}

export function BirthDateStep({
  value,
  onChange,
}: {
  value: BirthDateValue;
  onChange: (value: BirthDateValue) => void;
}) {
  return (
    <div className="flex gap-3">
      <Input
        inputMode="numeric"
        placeholder="Gün"
        maxLength={2}
        value={value.day}
        onChange={(e) => onChange({ ...value, day: digitsOnly(e.target.value, 2) })}
        className="h-12 flex-1 text-center text-base focus-visible:border-app-accent focus-visible:ring-app-accent/50"
      />
      <Input
        inputMode="numeric"
        placeholder="Ay"
        maxLength={2}
        value={value.month}
        onChange={(e) => onChange({ ...value, month: digitsOnly(e.target.value, 2) })}
        className="h-12 flex-1 text-center text-base focus-visible:border-app-accent focus-visible:ring-app-accent/50"
      />
      <Input
        inputMode="numeric"
        placeholder="Yıl"
        maxLength={4}
        value={value.year}
        onChange={(e) => onChange({ ...value, year: digitsOnly(e.target.value, 4) })}
        className="h-12 flex-1 text-center text-base focus-visible:border-app-accent focus-visible:ring-app-accent/50"
      />
    </div>
  );
}
