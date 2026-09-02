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

  const title = `${province.name} Kadın Kuaförü Salonları - Online Randevu | Looea`;
  const description = `${province.name} genelindeki kadın kuaförlerini keşfet, saç ve güzellik hizmetlerini karşılaştır, online randevu al.`;
  return { title, description, alternates: { canonical: `/kadin-kuaforu/${province.slug}` } };
}

export default async function FemaleSalonCityPage({ params }: { params: Promise<Params> }) {
  const { sehir } = await params;
  const province = findProvinceBySlug(sehir);
  if (!province) notFound();

  const [session, businesses] = await Promise.all([
    auth(),
    searchBusinesses({ city: province.name, serves: ["WOMEN", "UNISEX"], sort: "rating" }),
  ]);
  const favoriteIds = session?.user ? await getFavoriteIds() : new Set<string>();

  return (
    <BusinessListing
      title={`${province.name} Kadın Kuaförü Salonları`}
      subtitle={
        businesses.length > 0
          ? `${province.name} genelinde ${businesses.length} kadın kuaförü arasından seç, online randevunu al.`
          : `${province.name} genelinde kadın kuaförü salonları yakında eklenecek.`
      }
      businesses={businesses}
      favoriteIds={favoriteIds}
      isLoggedIn={!!session?.user}
    />
  );
}
