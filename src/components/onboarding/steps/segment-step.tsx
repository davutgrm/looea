"use client";

import { Scissors, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function SegmentStep({
  value,
  onSelect,
}: {
  value: "MALE" | "FEMALE" | null;
  onSelect: (segment: "MALE" | "FEMALE") => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <SegmentCard label="Erkek" icon={Scissors} selected={value === "MALE"} onClick={() => onSelect("MALE")} />
      <SegmentCard label="Kadın" icon={Sparkles} selected={value === "FEMALE"} onClick={() => onSelect("FEMALE")} />
    </div>
  );
}

function SegmentCard({
  label,
  icon: Icon,
  selected,
  onClick,
}: {
  label: string;
  icon: typeof Scissors;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-3xl border-2 p-10 text-center transition-colors",
        selected
          ? "border-app-accent bg-app-accent-soft"
          : "border-border hover:border-app-accent/40 hover:bg-accent/40",
      )}
    >
      <div
        className={cn(
          "flex size-16 items-center justify-center rounded-full",
          selected ? "bg-app-accent text-app-accent-foreground" : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="size-8" />
      </div>
      <span className="text-lg font-bold text-foreground">{label}</span>
    </button>
  );
}
