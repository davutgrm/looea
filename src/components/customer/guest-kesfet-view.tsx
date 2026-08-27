"use client";

import type { Category } from "@/generated/prisma/client";
import type { BusinessCard as BusinessCardData } from "@/lib/data/business";
import { servesForSegment } from "@/lib/business-types";
import { useGuestSegment } from "@/lib/guest-segment";
import { CategoryChips } from "./category-chips";
import { DiscoverRow } from "./discover-row";
import { ColdStartBusinessList } from "./cold-start-business-list";
import { GuestSegmentGate } from "./guest-segment-gate";
import { GuestSegmentSwitcher } from "./guest-segment-switcher";

const NEARBY_RADIUS_KM = 25;

export function GuestKesfetView({
  categories,
  featured,
  newest,
  allBusinesses,
}: {
  categories: Category[];
  featured: BusinessCardData[];
  newest: BusinessCardData[];
  allBusinesses: BusinessCardData[] | null;
}) {
  const { resolved, segment, select } = useGuestSegment();

  if (!resolved) return null;
  if (!segment) return <GuestSegmentGate onSelect={select} />;

  const serves = servesForSegment(segment)!;
  const visibleCategories = categories.filter((c) => serves.includes(c.serves));
  const favoriteIds = new Set<string>();

  if (allBusinesses) {
    const visibleAll = allBusinesses.filter((b) => serves.includes(b.serves));
    return (
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-6">
        <div className="flex items-center justify-end">
          <GuestSegmentSwitcher value={segment} onChange={select} />
        </div>

        <CategoryChips categories={visibleCategories} />
        <ColdStartBusinessList businesses={visibleAll} favoriteIds={favoriteIds} isLoggedIn={false} />
      </div>
    );
  }

  const visibleFeatured = featured.filter((b) => serves.includes(b.serves));
  const visibleNewest = newest.filter((b) => serves.includes(b.serves)).filter((b) => !visibleFeatured.some((f) => f.id === b.id));

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-6">
      <div className="flex items-center justify-end">
        <GuestSegmentSwitcher value={segment} onChange={select} />
      </div>

      <CategoryChips categories={visibleCategories} />

      <DiscoverRow
        title="Öne Çıkanlar"
        emoji="🔥"
        viewAllHref="/ara?sirala=rating"
        businesses={visibleFeatured}
        favoriteIds={favoriteIds}
        isLoggedIn={false}
      />

      <DiscoverRow
        title="Yeni Katılanlar"
        emoji="✨"
        viewAllHref="/ara"
        businesses={visibleNewest}
        favoriteIds={favoriteIds}
        isLoggedIn={false}
      />

      <DiscoverRow
        title="Yakınındakiler"
        emoji="📍"
        viewAllHref="/ara?sirala=distance"
        businesses={visibleFeatured}
        favoriteIds={favoriteIds}
        isLoggedIn={false}
        sortByDistance
        radiusKm={NEARBY_RADIUS_KM}
      />
    </div>
  );
}
