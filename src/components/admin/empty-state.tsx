import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  className,
}: {
  icon: LucideIcon;
  title: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-2.5 py-10 text-center", className)}>
      <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-4" />
      </div>
      <p className="text-sm text-muted-foreground">{title}</p>
    </div>
  );
}
