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

  const title = `${province.name} Erkek Berber Salonları - Online Randevu | Looea`;
  const description = `${province.name} genelindeki erkek berber salonlarını keşfet, saç ve sakal hizmetlerini karşılaştır, online randevu al.`;
  return { title, description, alternates: { canonical: `/erkek-berber/${province.slug}` } };
}

export default async function MaleBarberCityPage({ params }: { params: Promise<Params> }) {
  const { sehir } = await params;
  const province = findProvinceBySlug(sehir);
  if (!province) notFound();

  const [session, businesses] = await Promise.all([
    auth(),
    searchBusinesses({ city: province.name, serves: ["MEN", "UNISEX"], sort: "rating" }),
  ]);
  const favoriteIds = session?.user ? await getFavoriteIds() : new Set<string>();

  return (
    <BusinessListing
      title={`${province.name} Erkek Berber Salonları`}
      subtitle={
        businesses.length > 0
          ? `${province.name} genelinde ${businesses.length} erkek berber salonu arasından seç, online randevunu al.`
          : `${province.name} genelinde erkek berber salonları yakında eklenecek.`
      }
      businesses={businesses}
      favoriteIds={favoriteIds}
      isLoggedIn={!!session?.user}
    />
  );
}
