import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AppointmentStatusBadge } from "@/components/business/status-badge";
import { AppointmentStatusActions } from "@/components/business/appointment-status-actions";
import type { AppointmentStatus } from "@/generated/prisma/client";

export function AppointmentCard({
  id,
  customerName,
  serviceName,
  staffName,
  time,
  status,
}: {
  id: string;
  customerName: string;
  serviceName: string;
  staffName: string | null;
  time: string;
  status: AppointmentStatus;
}) {
  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-card p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar className="size-8 shrink-0">
            <AvatarFallback className="bg-app-accent-soft text-xs text-app-accent-soft-foreground">
              {customerName[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">{customerName}</span>
            <span className="truncate text-xs text-muted-foreground">
              {serviceName}
              {staffName ? ` · ${staffName}` : ""}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="text-sm font-semibold">{time}</span>
          <AppointmentStatusBadge status={status} />
        </div>
      </div>
      <AppointmentStatusActions id={id} status={status} size="xs" />
    </div>
  );
}
