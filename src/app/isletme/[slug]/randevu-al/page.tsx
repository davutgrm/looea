import { notFound, permanentRedirect } from "next/navigation";
import { getBusinessBySlug } from "@/lib/data/business";
import { getBusinessBookingPath } from "@/lib/business-url";

// Legacy booking URL — 301s to the SEO-friendly /kuafor/[il]/[ilce]/[slug]/randevu-al path.
export default async function LegacyBookingRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ hizmet?: string }>;
}) {
  const { slug } = await params;
  const { hizmet } = await searchParams;
  const business = await getBusinessBySlug(slug);
  if (!business || !business.active) notFound();

  const path = getBusinessBookingPath({ slug: business.slug, city: business.location?.city, district: business.location?.district });
  permanentRedirect(hizmet ? `${path}?hizmet=${hizmet}` : path);
}
