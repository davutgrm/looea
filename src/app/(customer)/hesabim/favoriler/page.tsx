import { Heart } from "lucide-react";
import { requireUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { BusinessGrid } from "@/components/customer/business-grid";
import type { BusinessCard } from "@/lib/data/business";
import { isAvailableNowEffective } from "@/lib/business-availability";

export default async function FavoritesPage() {
  const user = await requireUser();

  const favorites = await prisma.favorite.findMany({
    where: { customerId: user.id },
    include: {
      business: {
        include: {
          location: true,
          services: { where: { active: true }, orderBy: { price: "asc" } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const cards: BusinessCard[] = favorites.map((f) => ({
    id: f.business.id,
    slug: f.business.slug,
    name: f.business.name,
    type: f.business.type,
    serves: f.business.serves,
    logoUrl: f.business.logoUrl,
    coverImageUrl: f.business.coverImageUrl,
    verified: f.business.verified,
    availableNow: isAvailableNowEffective(f.business),
    ratingAvg: f.business.ratingAvg,
    ratingCount: f.business.ratingCount,
    createdAt: f.business.createdAt,
    city: f.business.location?.city ?? null,
    district: f.business.location?.district ?? null,
    location: f.business.location
      ? { lat: f.business.location.latitude, lng: f.business.location.longitude }
      : null,
    distanceKm: null,
    startingPrice: f.business.services[0]?.price ?? null,
    topCategory: null,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-2xl font-bold">Favorilerim</h1>
      {cards.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <Heart className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Henüz favoriniz yok.</p>
        </div>
      ) : (
        <div className="mt-4">
          <BusinessGrid businesses={cards} favoriteIds={new Set(cards.map((c) => c.id))} isLoggedIn />
        </div>
      )}
    </div>
  );
}
