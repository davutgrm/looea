"use client";

import { useMemo } from "react";
import { Scissors } from "lucide-react";
import { haversineDistanceKm } from "@/lib/maps/distance";
import type { BusinessCard as BusinessCardData } from "@/lib/data/business";
import { useLocation } from "./location-provider";
import { BusinessCard } from "./business-card";
import { EmptyState } from "./empty-state";

export function BusinessGrid({
  businesses,
  favoriteIds,
  isLoggedIn,
  sortByDistance = true,
  emptyMessage = "Şu an gösterilecek işletme yok.",
  emptyDescription,
}: {
  businesses: BusinessCardData[];
  favoriteIds: Set<string>;
  isLoggedIn: boolean;
  sortByDistance?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
}) {
  const { coords } = useLocation();

  const resolved = useMemo(() => {
    const withDistance = businesses.map((b) => ({
      ...b,
      distanceKm: coords && b.location ? haversineDistanceKm(coords, b.location) : b.distanceKm,
    }));
    if (sortByDistance && coords) {
      withDistance.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    }
    return withDistance;
  }, [businesses, coords, sortByDistance]);

  if (resolved.length === 0) {
    return (
      <EmptyState
        icon={Scissors}
        title={emptyMessage}
        description={emptyDescription}
        className="my-4"
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {resolved.map((business) => (
        <BusinessCard
          key={business.id}
          business={business}
          isFavorite={favoriteIds.has(business.id)}
          isLoggedIn={isLoggedIn}
        />
      ))}
    </div>
  );
}
