import { prisma } from "@/lib/prisma";
import { haversineDistanceKm } from "@/lib/maps/distance";
import { getAvailability } from "@/lib/availability";
import { isAvailableNowEffective } from "@/lib/business-availability";
import type { LatLng } from "@/lib/maps/types";
import type { BusinessServes } from "@/generated/prisma/client";

const cardInclude = {
  location: true,
  services: { where: { active: true }, orderBy: { price: "asc" as const } },
} as const;

export type BusinessCard = {
  id: string;
  slug: string;
  name: string;
  type: string;
  serves: BusinessServes;
  logoUrl: string | null;
  coverImageUrl: string | null;
  verified: boolean;
  availableNow: boolean;
  ratingAvg: number;
  ratingCount: number;
  city: string | null;
  district: string | null;
  location: LatLng | null;
  distanceKm: number | null;
  startingPrice: number | null;
  topCategory: string | null;
  createdAt: Date;
};

function toCard(
  business: {
    id: string;
    slug: string;
    name: string;
    type: string;
    serves: BusinessServes;
    logoUrl: string | null;
    coverImageUrl: string | null;
    verified: boolean;
    availableNow: boolean;
    availableNowUntil: Date | null;
    ratingAvg: number;
    ratingCount: number;
    createdAt: Date;
    location: { city: string; district: string; latitude: number; longitude: number } | null;
    services: { price: number }[];
  },
  origin?: LatLng | null,
): BusinessCard {
  return {
    id: business.id,
    slug: business.slug,
    name: business.name,
    type: business.type,
    serves: business.serves,
    logoUrl: business.logoUrl,
    coverImageUrl: business.coverImageUrl,
    verified: business.verified,
    availableNow: isAvailableNowEffective(business),
    ratingAvg: business.ratingAvg,
    ratingCount: business.ratingCount,
    createdAt: business.createdAt,
    city: business.location?.city ?? null,
    district: business.location?.district ?? null,
    location: business.location
      ? { lat: business.location.latitude, lng: business.location.longitude }
      : null,
    distanceKm:
      origin && business.location
        ? haversineDistanceKm(origin, { lat: business.location.latitude, lng: business.location.longitude })
        : null,
    startingPrice: business.services[0]?.price ?? null,
    topCategory: null,
  };
}

export async function getFeaturedBusinesses(
  origin?: LatLng | null,
  limit = 8,
  serves?: BusinessServes[] | null,
): Promise<BusinessCard[]> {
  const businesses = await prisma.business.findMany({
    where: { active: true, ...(serves ? { serves: { in: serves } } : {}) },
    include: cardInclude,
    orderBy: [{ verified: "desc" }, { ratingCount: "desc" }, { ratingAvg: "desc" }],
    take: limit,
  });
  return businesses.map((b) => toCard(b, origin));
}

export type BusinessSort = "distance" | "rating" | "price" | "soonest";

export async function searchBusinesses(params: {
  query?: string;
  categorySlug?: string;
  origin?: LatLng | null;
  radiusKm?: number;
  sort?: BusinessSort;
  bounds?: { north: number; south: number; east: number; west: number };
  serves?: BusinessServes[] | null;
  city?: string;
  district?: string;
  minRating?: number;
  maxPrice?: number;
}): Promise<BusinessCard[]> {
  const { query, categorySlug, origin, radiusKm, sort = "distance", bounds, serves, city, district, minRating, maxPrice } = params;

  const businesses = await prisma.business.findMany({
    where: {
      active: true,
      ...(serves ? { serves: { in: serves } } : {}),
      ...(query
        ? {
            OR: [
              { name: { contains: query } },
              { services: { some: { name: { contains: query } } } },
            ],
          }
        : {}),
      ...(categorySlug
        ? { services: { some: { category: { slug: categorySlug } } } }
        : {}),
      ...(bounds || city || district
        ? {
            location: {
              ...(bounds
                ? {
                    latitude: { gte: bounds.south, lte: bounds.north },
                    longitude: { gte: bounds.west, lte: bounds.east },
                  }
                : {}),
              ...(city ? { city } : {}),
              ...(district ? { district } : {}),
            },
          }
        : {}),
      ...(minRating ? { ratingAvg: { gte: minRating } } : {}),
    },
    include: cardInclude,
  });

  let cards = businesses.map((b) => toCard(b, origin));

  if (origin && radiusKm) {
    cards = cards.filter((c) => c.distanceKm === null || c.distanceKm <= radiusKm);
  }
  if (maxPrice) {
    cards = cards.filter((c) => c.startingPrice === null || c.startingPrice <= maxPrice);
  }

  switch (sort) {
    case "rating":
      cards.sort((a, b) => b.ratingAvg - a.ratingAvg || b.ratingCount - a.ratingCount);
      break;
    case "price":
      cards.sort((a, b) => (a.startingPrice ?? Infinity) - (b.startingPrice ?? Infinity));
      break;
    case "distance":
    default:
      if (origin) cards.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
      break;
  }

  return cards;
}

export async function getBusinessBySlug(slug: string) {
  return prisma.business.findUnique({
    where: { slug },
    include: {
      location: true,
      hours: { orderBy: { dayOfWeek: "asc" } },
      staff: { where: { active: true }, include: { services: true } },
      services: {
        where: { active: true },
        include: { category: true, staff: { include: { staff: true } } },
        orderBy: { price: "asc" },
      },
      portfolioImages: { orderBy: { order: "asc" }, include: { category: true } },
      reviews: {
        where: { hidden: false },
        include: { customer: { select: { name: true, avatarUrl: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      subscription: { include: { plan: true } },
    },
  });
}

export async function getNewestBusinesses(
  limit = 12,
  serves?: BusinessServes[] | null,
): Promise<BusinessCard[]> {
  const businesses = await prisma.business.findMany({
    where: { active: true, ...(serves ? { serves: { in: serves } } : {}) },
    include: cardInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return businesses.map((b) => toCard(b));
}

export async function getActiveBusinessCount(serves?: BusinessServes[] | null): Promise<number> {
  return prisma.business.count({ where: { active: true, ...(serves ? { serves: { in: serves } } : {}) } });
}

export async function getNextAvailableSlot(businessId: string): Promise<{ date: Date; time: string } | null> {
  const cheapestService = await prisma.service.findFirst({
    where: { businessId, active: true },
    orderBy: { price: "asc" },
  });
  if (!cheapestService) return null;

  for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    date.setHours(0, 0, 0, 0);

    const availability = await getAvailability({ businessId, serviceIds: [cheapestService.id], date });
    const firstSlot = availability.flatMap((a) => a.slots).sort()[0];
    if (firstSlot) return { date, time: firstSlot };
  }
  return null;
}
