import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { PageHeader } from "@/components/admin/page-header";
import { ReviewsTable } from "@/components/admin/reviews-table";
import { Pager } from "@/components/admin/pager";

const PAGE_SIZE = 20;

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ sayfa?: string }>;
}) {
  await requireRole("ADMIN");
  const params = await searchParams;
  const page = Math.max(1, Number(params.sayfa) || 1);

  const [total, reviews] = await Promise.all([
    prisma.review.count(),
    prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        business: { select: { name: true } },
        customer: { select: { name: true } },
      },
    }),
  ]);

  const rows = reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    hidden: r.hidden,
    createdAtLabel: format(r.createdAt, "d MMM yyyy", { locale: tr }),
    businessName: r.business.name,
    customerName: r.customer.name,
  }));

  return (
    <div>
      <PageHeader title="Yorumlar" description="Platform genelindeki müşteri yorumlarını denetleyin." />
      <ReviewsTable reviews={rows} />
      <Pager basePath="/admin/yorumlar" params={{}} page={page} pageSize={PAGE_SIZE} total={total} />
    </div>
  );
}
