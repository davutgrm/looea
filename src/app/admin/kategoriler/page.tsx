import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { PageHeader } from "@/components/admin/page-header";
import { CategoriesManager } from "@/components/admin/categories-manager";

export default async function AdminCategoriesPage() {
  await requireRole("ADMIN");

  const categories = await prisma.category.findMany({
    orderBy: [{ group: "asc" }, { order: "asc" }],
    include: { _count: { select: { services: true } } },
  });

  const rows = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    group: c.group,
    order: c.order,
    active: c.active,
    serviceCount: c._count.services,
  }));

  return (
    <div>
      <PageHeader
        title="Kategoriler"
        description="Platform genelinde kullanılan hizmet kategorilerini yönetin. Bu liste tüm hizmet kategorilerinin tek kaynağıdır."
      />
      <CategoriesManager categories={rows} />
    </div>
  );
}
