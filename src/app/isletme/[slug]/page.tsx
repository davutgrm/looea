import { notFound, permanentRedirect } from "next/navigation";
import { getBusinessBySlug } from "@/lib/data/business";
import { getBusinessPath } from "@/lib/business-url";

// Legacy profile URL — 301s to the SEO-friendly /kuafor/[il]/[ilce]/[slug] path
// so old bookmarks/backlinks keep working without ever 404ing.
export default async function LegacyBusinessProfileRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);
  if (!business || !business.active) notFound();

  permanentRedirect(getBusinessPath({ slug: business.slug, city: business.location?.city, district: business.location?.district }));
}
