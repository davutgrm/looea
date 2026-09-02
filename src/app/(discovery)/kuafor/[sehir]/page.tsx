import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { findProvinceBySlug } from "@/lib/turkey-locations";
import { searchBusinesses } from "@/lib/data/business";
import { getFavoriteIds } from "@/lib/data/favorites";
import { BusinessListing } from "@/components/discovery/business-listing";

type Params = { sehir: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { sehir } = await params;
  const province = findProvinceBySlug(sehir);
  if (!province) return {};

  const title = `${province.name} Kuaför ve Berber Salonları - Online Randevu | Looea`;
  const description = `${province.name} genelindeki en iyi kuaför, berber ve güzellik salonlarını keşfet, hizmetleri karşılaştır, saniyeler içinde online randevu al.`;
  return { title, description, alternates: { canonical: `/kuafor/${province.slug}` } };
}

export default async function CityLandingPage({ params }: { params: Promise<Params> }) {
  const { sehir } = await params;
  const province = findProvinceBySlug(sehir);
  if (!province) notFound();

  const [session, businesses] = await Promise.all([
    auth(),
    searchBusinesses({ city: province.name, sort: "rating" }),
  ]);
  const favoriteIds = session?.user ? await getFavoriteIds() : new Set<string>();

  const activeDistrictNames = new Set(businesses.map((b) => b.district).filter((d): d is string => !!d));
  const districtLinks = province.districts
    .filter((d) => activeDistrictNames.has(d.name))
    .map((d) => ({ label: d.name, href: `/kuafor/${province.slug}/${d.slug}` }));

  return (
    <BusinessListing
      title={`${province.name} Kuaför ve Berber Salonları`}
      subtitle={
        businesses.length > 0
          ? `${province.name} genelinde ${businesses.length} salon arasından seç, hizmetleri ve fiyatları karşılaştır, online randevunu al.`
          : `${province.name} genelinde salonlar yakında eklenecek.`
      }
      businesses={businesses}
      favoriteIds={favoriteIds}
      isLoggedIn={!!session?.user}
      districtLinks={districtLinks}
    />
  );
}
