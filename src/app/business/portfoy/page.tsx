import { requireBusiness } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/business/page-header";
import { PortfolioManager } from "@/components/business/portfolio-manager";

export default async function PortfoyPage() {
  const { businessId } = await requireBusiness();

  const [images, categories] = await Promise.all([
    prisma.portfolioImage.findMany({
      where: { businessId },
      orderBy: { order: "asc" },
      include: { category: { select: { name: true } } },
    }),
    prisma.category.findMany({ where: { active: true }, orderBy: [{ group: "asc" }, { order: "asc" }] }),
  ]);

  const rows = images.map((img) => ({
    id: img.id,
    imageUrl: img.imageUrl,
    order: img.order,
    categoryId: img.categoryId,
    categoryName: img.category?.name ?? null,
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Portföy" />

      <PortfolioManager images={rows} categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  );
}
