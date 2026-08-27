import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getBusinessBySlug } from "@/lib/data/business";
import { BookingWizard } from "@/components/customer/booking-wizard";

export default async function BookAppointmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ sehir: string; ilce: string; slug: string }>;
  searchParams: Promise<{ hizmet?: string }>;
}) {
  const { sehir, ilce, slug } = await params;
  const { hizmet } = await searchParams;
  const session = await auth();
  if (!session?.user) {
    const callbackUrl = `/kuafor/${sehir}/${ilce}/${slug}/randevu-al${hizmet ? `?hizmet=${hizmet}` : ""}`;
    redirect(`/giris?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const business = await getBusinessBySlug(slug);
  if (!business || !business.active) notFound();

  return (
    <BookingWizard
      businessId={business.id}
      businessName={business.name}
      businessLogoUrl={business.logoUrl}
      businessAddress={business.location ? `${business.location.address}, ${business.location.city}` : null}
      services={business.services}
      initialServiceId={hizmet && business.services.some((s) => s.id === hizmet) ? hizmet : null}
    />
  );
}
