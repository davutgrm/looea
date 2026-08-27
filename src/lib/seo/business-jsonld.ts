const SCHEMA_DAY_NAMES = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

type JsonLdBusiness = {
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  phone: string | null;
  ratingAvg: number;
  ratingCount: number;
  location: { address: string; city: string; district: string; postalCode: string | null; latitude: number; longitude: number } | null;
  hours: { dayOfWeek: number; openTime: string | null; closeTime: string | null; isClosed: boolean }[];
  services: { price: number }[];
};

/** LocalBusiness (HairSalon) structured data for a business profile page — see https://schema.org/HairSalon */
export function buildBusinessJsonLd(business: JsonLdBusiness, canonicalUrl: string) {
  const prices = business.services.map((s) => s.price).filter((p) => p > 0);
  const priceRange = prices.length > 0 ? `${Math.min(...prices)}₺ - ${Math.max(...prices)}₺` : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    name: business.name,
    url: canonicalUrl,
    image: business.coverImageUrl ?? business.logoUrl ?? undefined,
    logo: business.logoUrl ?? undefined,
    description: business.description ?? undefined,
    telephone: business.phone ?? undefined,
    priceRange,
    address: business.location
      ? {
          "@type": "PostalAddress",
          streetAddress: business.location.address,
          addressLocality: business.location.district,
          addressRegion: business.location.city,
          postalCode: business.location.postalCode ?? undefined,
          addressCountry: "TR",
        }
      : undefined,
    geo: business.location
      ? {
          "@type": "GeoCoordinates",
          latitude: business.location.latitude,
          longitude: business.location.longitude,
        }
      : undefined,
    openingHoursSpecification: business.hours
      .filter((h) => !h.isClosed && h.openTime && h.closeTime)
      .map((h) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: `https://schema.org/${SCHEMA_DAY_NAMES[h.dayOfWeek]}`,
        opens: h.openTime,
        closes: h.closeTime,
      })),
    aggregateRating:
      business.ratingCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: business.ratingAvg,
            reviewCount: business.ratingCount,
          }
        : undefined,
  };
}
