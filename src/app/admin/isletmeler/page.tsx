import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { PageHeader } from "@/components/admin/page-header";
import { BusinessesFilterBar } from "@/components/admin/businesses-filter-bar";
import { BusinessesTable } from "@/components/admin/businesses-table";
import { Pager } from "@/components/admin/pager";
import { BUSINESS_TYPE_LABELS } from "@/lib/business-types";
import type { Prisma } from "@/generated/prisma/client";

const PAGE_SIZE = 20;

export default async function AdminBusinessesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    aktif?: string;
    dogrulanmis?: string;
    plan?: string;
    sayfa?: string;
  }>;
}) {
  await requireRole("ADMIN");
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const aktif = params.aktif === "true" || params.aktif === "false" ? params.aktif : "";
  const dogrulanmis =
    params.dogrulanmis === "true" || params.dogrulanmis === "false" ? params.dogrulanmis : "";
  const plan = params.plan?.trim() ?? "";
  const page = Math.max(1, Number(params.sayfa) || 1);

  const where: Prisma.BusinessWhereInput = {};
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { owner: { name: { contains: q } } },
      { owner: { email: { contains: q } } },
    ];
  }
  if (aktif) where.active = aktif === "true";
  if (dogrulanmis) where.verified = dogrulanmis === "true";
  if (plan) where.subscription = { plan: { slug: plan } };

  const [total, businesses, planOptions] = await Promise.all([
    prisma.business.count({ where }),
    prisma.business.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        owner: { select: { name: true, email: true } },
        location: { select: { city: true } },
        subscription: { include: { plan: { select: { name: true, slug: true } } } },
      },
    }),
    prisma.subscriptionPlan.findMany({ orderBy: { order: "asc" }, select: { slug: true, name: true } }),
  ]);

  const rows = businesses.map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    typeLabel: BUSINESS_TYPE_LABELS[b.type],
    ownerName: b.owner.name,
    ownerEmail: b.owner.email,
    city: b.location?.city ?? null,
    planName: b.subscription?.plan.name ?? null,
    verified: b.verified,
    active: b.active,
  }));

  return (
    <div>
      <PageHeader
        title="İşletmeler"
        description="Platformdaki tüm işletmeleri görüntüleyin, doğrulayın ve yönetin."
      />
      <BusinessesFilterBar q={q} aktif={aktif} dogrulanmis={dogrulanmis} plan={plan} planOptions={planOptions} />
      <BusinessesTable businesses={rows} />
      <Pager
        basePath="/admin/isletmeler"
        params={{ q, aktif, dogrulanmis, plan }}
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
      />
    </div>
  );
}
