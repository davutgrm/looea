"use client";

import Link from "next/link";
import { useTransition } from "react";
import { CalendarPlus, CalendarCheck, CalendarClock, CalendarX, Star, Bell, type LucideIcon } from "lucide-react";
import { formatRelativeTime } from "@/lib/date";
import { markNotificationRead } from "@/lib/actions/customer";
import { cn } from "@/lib/utils";
import type { NotificationType } from "@/generated/prisma/client";

const TYPE_ICON: Record<NotificationType, LucideIcon> = {
  APPOINTMENT_CREATED: CalendarPlus,
  APPOINTMENT_CONFIRMED: CalendarCheck,
  APPOINTMENT_REMINDER: CalendarClock,
  APPOINTMENT_CANCELLED: CalendarX,
  NEW_REVIEW: Star,
  SYSTEM: Bell,
};

const TYPE_HREF: Record<NotificationType, string> = {
  APPOINTMENT_CREATED: "/hesabim/randevularim",
  APPOINTMENT_CONFIRMED: "/hesabim/randevularim",
  APPOINTMENT_REMINDER: "/hesabim/randevularim",
  APPOINTMENT_CANCELLED: "/hesabim/randevularim",
  NEW_REVIEW: "/hesabim/yorumlarim",
  SYSTEM: "/hesabim",
};

export function NotificationRow({
  id,
  type,
  title,
  body,
  read,
  createdAt,
}: {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  read: boolean;
  createdAt: Date;
}) {
  const [, startTransition] = useTransition();
  const Icon = TYPE_ICON[type];

  function handleClick() {
    if (!read) startTransition(async () => { await markNotificationRead(id); });
  }

  return (
    <Link
      href={TYPE_HREF[type]}
      onClick={handleClick}
      className={cn(
        "flex items-start gap-3 rounded-2xl border p-3.5 shadow-sm transition-colors hover:bg-muted/50",
        read ? "bg-card" : "bg-app-accent-soft/40 border-app-accent/30",
      )}
    >
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full",
          read ? "bg-muted text-muted-foreground" : "bg-app-accent-soft text-app-accent-soft-foreground",
        )}
      >
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm", read ? "font-medium" : "font-semibold")}>{title}</p>
          {!read && <span className="mt-1 size-2 shrink-0 rounded-full bg-app-accent" aria-hidden />}
        </div>
        {body && <p className="mt-0.5 text-sm text-muted-foreground">{body}</p>}
        <p className="mt-1 text-xs text-muted-foreground">{formatRelativeTime(createdAt)}</p>
      </div>
    </Link>
  );
}
