"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { haversineDistanceKm } from "@/lib/maps/distance";
import type { BusinessCard as BusinessCardData } from "@/lib/data/business";
import { useLocation } from "./location-provider";
import { DiscoverCard } from "./discover-card";
import { MapCtaCard } from "./map-cta-card";

// Below this many distinct businesses, a row reads as "half-empty" rather than
// a real category — hide it instead (see /kesfet cold-start handling).
const MIN_ROW_SIZE = 6;

export function DiscoverRow({
  title,
  emoji,
  viewAllHref,
  businesses,
  favoriteIds,
  isLoggedIn,
  sortByDistance = false,
  radiusKm,
}: {
  title: string;
  emoji: string;
  viewAllHref: string;
  businesses: BusinessCardData[];
  favoriteIds: Set<string>;
  isLoggedIn: boolean;
  sortByDistance?: boolean;
  radiusKm?: number;
}) {
  const { coords } = useLocation();

  const resolved = useMemo(() => {
    const withDistance = businesses.map((b) => ({
      ...b,
      distanceKm: coords && b.location ? haversineDistanceKm(coords, b.location) : b.distanceKm,
    }));
    const filtered =
      radiusKm && coords
        ? withDistance.filter((b) => b.distanceKm === null || b.distanceKm <= radiusKm)
        : withDistance;
    if (sortByDistance && coords) {
      filtered.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    }
    return filtered;
  }, [businesses, coords, sortByDistance, radiusKm]);

  if (resolved.length < MIN_ROW_SIZE) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">
          {emoji} {title}
        </h2>
        <Link
          href={viewAllHref}
          className="flex items-center gap-1 text-sm font-medium text-app-accent hover:underline"
        >
          Tümünü Gör <ArrowRight className="size-3.5" />
        </Link>
      </div>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-4">
        {resolved.map((business) => (
          <DiscoverCard
            key={business.id}
            business={business}
            isFavorite={favoriteIds.has(business.id)}
            isLoggedIn={isLoggedIn}
          />
        ))}
        <MapCtaCard href={viewAllHref} />
      </div>
    </section>
  );
}
