import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getBusinessPath } from "@/lib/business-url";
import { matchProvince, matchDistrict } from "@/lib/turkey-locations";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const businesses = await prisma.business.findMany({
    where: { active: true },
    select: { slug: true, updatedAt: true, serves: true, location: { select: { city: true, district: true } } },
  });

  const businessEntries: MetadataRoute.Sitemap = businesses.map((b) => ({
    url: `${SITE_URL}${getBusinessPath({ slug: b.slug, city: b.location?.city, district: b.location?.district })}`,
    lastModified: b.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const cityKeys = new Set<string>();
  const districtKeys = new Set<string>();
  const maleCityKeys = new Set<string>();
  const femaleCityKeys = new Set<string>();

  for (const b of businesses) {
    const province = matchProvince(b.location?.city);
    const district = matchDistrict(province, b.location?.district);
    if (!province) continue;
    cityKeys.add(province.slug);
    if (district) districtKeys.add(`${province.slug}/${district.slug}`);
    if (b.serves === "MEN" || b.serves === "UNISEX") maleCityKeys.add(province.slug);
    if (b.serves === "WOMEN" || b.serves === "UNISEX") femaleCityKeys.add(province.slug);
  }

  const cityEntries: MetadataRoute.Sitemap = Array.from(cityKeys).map((slug) => ({
    url: `${SITE_URL}/kuafor/${slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));
  const districtEntries: MetadataRoute.Sitemap = Array.from(districtKeys).map((path) => ({
    url: `${SITE_URL}/kuafor/${path}`,
    changeFrequency: "weekly",
    priority: 0.5,
  }));
  const maleEntries: MetadataRoute.Sitemap = Array.from(maleCityKeys).map((slug) => ({
    url: `${SITE_URL}/erkek-berber/${slug}`,
    changeFrequency: "weekly",
    priority: 0.5,
  }));
  const femaleEntries: MetadataRoute.Sitemap = Array.from(femaleCityKeys).map((slug) => ({
    url: `${SITE_URL}/kadin-kuaforu/${slug}`,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const staticEntries: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/kesfet`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/ara`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/isletme-kaydet`, changeFrequency: "monthly", priority: 0.4 },
  ];

  return [...staticEntries, ...cityEntries, ...districtEntries, ...maleEntries, ...femaleEntries, ...businessEntries];
}
