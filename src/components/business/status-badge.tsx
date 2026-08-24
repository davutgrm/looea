import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AppointmentStatus } from "@/generated/prisma/client";

export const APPOINTMENT_STATUS_META: Record<AppointmentStatus, { label: string; className: string }> = {
  PENDING: { label: "Bekliyor", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  CONFIRMED: {
    label: "Onaylandı",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  COMPLETED: {
    label: "Tamamlandı",
    className: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
  },
  CANCELLED: { label: "İptal Edildi", className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
  NO_SHOW: { label: "Gelmedi", className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
};

export function AppointmentStatusBadge({ status, className }: { status: AppointmentStatus; className?: string }) {
  const meta = APPOINTMENT_STATUS_META[status];
  return (
    <Badge variant="secondary" className={cn(meta.className, className)}>
      {meta.label}
    </Badge>
  );
}
