import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { findProvinceBySlug, findDistrictBySlug } from "@/lib/turkey-locations";
import { searchBusinesses } from "@/lib/data/business";
import { getFavoriteIds } from "@/lib/data/favorites";
import { BusinessListing } from "@/components/discovery/business-listing";

type Params = { sehir: string; ilce: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { sehir, ilce } = await params;
  const province = findProvinceBySlug(sehir);
  const district = findDistrictBySlug(sehir, ilce);
  if (!province || !district) return {};

  const title = `${district.name} Kuaför ve Berber Salonları | ${province.name} - Looea`;
  const description = `${district.name}, ${province.name} bölgesindeki kuaför, berber ve güzellik salonlarını keşfet, saniyeler içinde online randevu al.`;
  return { title, description, alternates: { canonical: `/kuafor/${province.slug}/${district.slug}` } };
}

export default async function DistrictLandingPage({ params }: { params: Promise<Params> }) {
  const { sehir, ilce } = await params;
  const province = findProvinceBySlug(sehir);
  const district = findDistrictBySlug(sehir, ilce);
  if (!province || !district) notFound();

  const [session, businesses] = await Promise.all([
    auth(),
    searchBusinesses({ city: province.name, district: district.name, sort: "rating" }),
  ]);
  const favoriteIds = session?.user ? await getFavoriteIds() : new Set<string>();

  return (
    <BusinessListing
      title={`${district.name} Kuaför ve Berber Salonları`}
      subtitle={
        businesses.length > 0
          ? `${district.name}, ${province.name} bölgesinde ${businesses.length} salon arasından seç, hizmetleri ve fiyatları karşılaştır.`
          : `${district.name}, ${province.name} bölgesinde salonlar yakında eklenecek.`
      }
      businesses={businesses}
      favoriteIds={favoriteIds}
      isLoggedIn={!!session?.user}
      districtLinks={[{ label: `Tüm ${province.name}`, href: `/kuafor/${province.slug}` }]}
    />
  );
}
