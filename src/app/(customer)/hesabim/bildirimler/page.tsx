import { Bell } from "lucide-react";
import { requireUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/customer/empty-state";
import { NotificationRow } from "@/components/customer/notification-row";
import { MarkAllReadButton } from "@/components/customer/mark-all-read-button";

export default async function NotificationsPage() {
  const user = await requireUser();

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Bildirimler</h1>
          <p className="mt-1 text-sm text-muted-foreground">Randevu hareketlerin burada görünür.</p>
        </div>
        {unreadCount > 0 && <MarkAllReadButton />}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={Bell}
          title="Henüz bildirimin yok"
          description="Randevu hareketlerin burada görünecek."
        />
      ) : (
        <div className="mt-6 space-y-2.5">
          {notifications.map((n) => (
            <NotificationRow
              key={n.id}
              id={n.id}
              type={n.type}
              title={n.title}
              body={n.body}
              read={n.read}
              createdAt={n.createdAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}
