"use client";

import { Input } from "@/components/ui/input";

export function isValidPhone(phone: string): boolean {
  return /^5\d{9}$/.test(phone);
}

export function PhoneStep({ value, onChange }: { value: string; onChange: (phone: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-12 shrink-0 items-center rounded-lg border border-input bg-muted px-3.5 text-base font-medium text-muted-foreground">
        +90
      </div>
      <Input
        inputMode="numeric"
        placeholder="5XX XXX XX XX"
        maxLength={10}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 10))}
        className="h-12 flex-1 text-base focus-visible:border-app-accent focus-visible:ring-app-accent/50"
      />
    </div>
  );
}
