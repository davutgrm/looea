import { requireBusiness } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/business/page-header";
import { ProfileForm } from "@/components/business/profile-form";
import { LocationForm } from "@/components/business/location-form";
import { HoursEditor } from "@/components/business/hours-editor";

export default async function AyarlarPage() {
  const { businessId } = await requireBusiness();

  const [business, location, hours] = await Promise.all([
    prisma.business.findUniqueOrThrow({ where: { id: businessId } }),
    prisma.businessLocation.findUnique({ where: { businessId } }),
    prisma.businessHours.findMany({ where: { businessId } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Ayarlar" />

      <ProfileForm
        initialValues={{
          name: business.name,
          description: business.description ?? "",
          logoUrl: business.logoUrl ?? "",
          coverImageUrl: business.coverImageUrl ?? "",
          phone: business.phone ?? "",
          email: business.email ?? "",
          instagram: business.instagram ?? "",
          website: business.website ?? "",
          serves: business.serves,
        }}
      />

      <LocationForm
        initialValues={{
          address: location?.address ?? "",
          city: location?.city ?? "",
          postalCode: location?.postalCode ?? "",
          latitude: location?.latitude ?? 41.0082,
          longitude: location?.longitude ?? 28.9784,
        }}
      />

      <HoursEditor
        initialHours={hours.map((h) => ({
          dayOfWeek: h.dayOfWeek,
          openTime: h.openTime,
          closeTime: h.closeTime,
          isClosed: h.isClosed,
        }))}
      />
    </div>
  );
}
