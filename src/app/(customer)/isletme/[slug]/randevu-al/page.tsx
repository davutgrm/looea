import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getBusinessBySlug } from "@/lib/data/business";
import { BookingWizard } from "@/components/customer/booking-wizard";

export default async function BookAppointmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ hizmet?: string }>;
}) {
  const { slug } = await params;
  const { hizmet } = await searchParams;
  const session = await auth();
  if (!session?.user) redirect(`/giris?callbackUrl=/isletme/${slug}/randevu-al`);

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
