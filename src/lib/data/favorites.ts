import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getFavoriteIds(): Promise<Set<string>> {
  const session = await auth();
  if (!session?.user) return new Set();
  const favorites = await prisma.favorite.findMany({
    where: { customerId: session.user.id },
    select: { businessId: true },
  });
  return new Set(favorites.map((f) => f.businessId));
}
