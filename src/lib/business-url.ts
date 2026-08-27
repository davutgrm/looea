import { matchProvince, matchDistrict } from "@/lib/turkey-locations";

export type BusinessUrlInput = {
  slug: string;
  city?: string | null;
  district?: string | null;
};

/**
 * Canonical, indexable path for a business profile: /kuafor/[il]/[ilce]/[slug].
 * Falls back to the legacy /isletme/[slug] path (which itself 301-redirects here)
 * for the rare business with a location that doesn't resolve to a known il/ilçe,
 * so links never 404.
 */
export function getBusinessPath(business: BusinessUrlInput): string {
  const province = matchProvince(business.city);
  const district = matchDistrict(province, business.district);
  if (province && district) {
    return `/kuafor/${province.slug}/${district.slug}/${business.slug}`;
  }
  return `/isletme/${business.slug}`;
}

export function getBusinessBookingPath(business: BusinessUrlInput): string {
  return `${getBusinessPath(business)}/randevu-al`;
}
