import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@/generated/prisma/client";

export async function notify(
  userId: string,
  type: NotificationType,
  title: string,
  body?: string,
) {
  await prisma.notification.create({ data: { userId, type, title, body } });
}
