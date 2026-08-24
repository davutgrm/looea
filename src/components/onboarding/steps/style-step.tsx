"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type StyleOption = { id: string; name: string };

export function StyleStep({
  options,
  value,
  onChange,
}: {
  options: StyleOption[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  function toggle(option: string) {
    onChange(value.includes(option) ? value.filter((v) => v !== option) : [...value, option]);
  }

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {options.map((opt) => {
        const active = value.includes(opt.name);
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => toggle(opt.name)}
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
            <span className="truncate">{opt.name}</span>
          </button>
        );
      })}
    </div>
  );
}
