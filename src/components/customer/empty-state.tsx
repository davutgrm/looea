import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-muted/40 p-4 sm:p-8", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 grid grid-cols-2 gap-3 p-4 opacity-40 sm:p-8"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-border/70" />
        ))}
      </div>
      <div className="relative mx-auto flex max-w-xs flex-col items-center gap-3 rounded-2xl bg-card px-6 py-7 text-center shadow-sm">
        <div className="flex size-11 items-center justify-center rounded-full bg-app-accent-soft text-app-accent-soft-foreground">
          <Icon className="size-5" />
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="font-grotesk text-base font-bold">{title}</h3>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {action}
      </div>
    </div>
  );
}
