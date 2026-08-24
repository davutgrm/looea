import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatRow({
  stats,
  className,
}: {
  stats: { icon: LucideIcon; label: string; value: ReactNode; hint?: string }[];
  className?: string;
}) {
  return (
    <div
      className={cn("grid gap-px overflow-hidden rounded-2xl border border-border bg-border", className)}
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
    >
      {stats.map((s, i) => (
        <div key={i} className="flex items-center gap-3 bg-card p-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-app-accent-soft text-app-accent-soft-foreground">
            <s.icon className="size-4.5" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="font-grotesk text-2xl leading-tight font-bold tracking-tight">{s.value}</span>
            <span className="truncate text-xs text-muted-foreground">{s.label}</span>
            {s.hint ? <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">{s.hint}</span> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
