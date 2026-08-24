"use server";

import { searchBusinesses, getNextAvailableSlot, type BusinessSort } from "@/lib/data/business";
import type { LatLng, MapBounds } from "@/lib/maps/types";

export async function searchBusinessesAction(params: {
  query?: string;
  categorySlug?: string;
  origin?: LatLng | null;
  radiusKm?: number;
  sort?: BusinessSort;
  bounds?: MapBounds;
}) {
  return searchBusinesses(params);
}

export async function getAvailabilityBadges(businessIds: string[]) {
  const entries = await Promise.all(
    businessIds.map(async (id) => {
      const slot = await getNextAvailableSlot(id);
      return [id, slot] as const;
    }),
  );
  return Object.fromEntries(entries) as Record<string, { date: Date; time: string } | null>;
}
