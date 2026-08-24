import { requireBusiness } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/business/page-header";
import { ServicesManager } from "@/components/business/services-manager";

export default async function HizmetlerPage() {
  const { businessId } = await requireBusiness();

  const [services, categories, staff] = await Promise.all([
    prisma.service.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
      include: { category: { select: { name: true } }, staff: { select: { staffId: true } } },
    }),
    prisma.category.findMany({ where: { active: true }, orderBy: [{ group: "asc" }, { order: "asc" }] }),
    prisma.businessStaff.findMany({
      where: { businessId, active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const serviceRows = services.map((s) => ({
    id: s.id,
    name: s.name,
    categoryId: s.categoryId,
    categoryName: s.category.name,
    description: s.description,
    durationMinutes: s.durationMinutes,
    price: s.price,
    imageUrl: s.imageUrl,
    active: s.active,
    staffIds: s.staff.map((x) => x.staffId),
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Hizmetler" />

      <ServicesManager
        services={serviceRows}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        staffOptions={staff}
      />
    </div>
  );
}
