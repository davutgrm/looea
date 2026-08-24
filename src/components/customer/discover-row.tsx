"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { haversineDistanceKm } from "@/lib/maps/distance";
import type { BusinessCard as BusinessCardData } from "@/lib/data/business";
import { useLocation } from "./location-provider";
import { DiscoverCard } from "./discover-card";

export function DiscoverRow({
  title,
  emoji,
  viewAllHref,
  businesses,
  favoriteIds,
  isLoggedIn,
  sortByDistance = false,
}: {
  title: string;
  emoji: string;
  viewAllHref: string;
  businesses: BusinessCardData[];
  favoriteIds: Set<string>;
  isLoggedIn: boolean;
  sortByDistance?: boolean;
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

  if (resolved.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {emoji} {title}
        </h2>
        <Link
          href={viewAllHref}
          className="flex items-center gap-1 text-sm font-medium text-app-accent hover:underline"
        >
          Tümünü Gör <ArrowRight className="size-3.5" />
        </Link>
      </div>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {resolved.map((business) => (
          <DiscoverCard
            key={business.id}
            business={business}
            isFavorite={favoriteIds.has(business.id)}
            isLoggedIn={isLoggedIn}
          />
        ))}
      </div>
    </section>
  );
}
