"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const STYLE_OPTIONS = [
  "Kadın Kuaförü",
  "Erkek Berber",
  "Unisex",
  "Balayage",
  "Saç Boyama",
  "Nail",
  "Cilt Bakımı",
  "Kaş/Kirpik",
  "Makyaj",
  "Gelin Saçı",
];

export function StyleStep({ value, onChange }: { value: string[]; onChange: (value: string[]) => void }) {
  function toggle(option: string) {
    onChange(value.includes(option) ? value.filter((v) => v !== option) : [...value, option]);
  }

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {STYLE_OPTIONS.map((opt) => {
        const active = value.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={cn(
              "flex items-center gap-2 rounded-2xl border px-3.5 py-3 text-left text-sm font-medium transition-colors",
              active
                ? "border-app-accent bg-app-accent-soft text-app-accent-soft-foreground"
                : "border-border hover:border-app-accent/50",
            )}
          >
            <span
              className={cn(
                "flex size-4 shrink-0 items-center justify-center rounded-full border",
                active ? "border-app-accent bg-app-accent text-app-accent-foreground" : "border-border",
              )}
            >
              {active && <Check className="size-2.5" />}
            </span>
            <span className="truncate">{opt}</span>
          </button>
        );
      })}
    </div>
  );
}
