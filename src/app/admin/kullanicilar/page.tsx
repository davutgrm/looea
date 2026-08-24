import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { PageHeader } from "@/components/admin/page-header";
import { UsersFilterBar } from "@/components/admin/users-filter-bar";
import { UsersTable } from "@/components/admin/users-table";
import { Pager } from "@/components/admin/pager";
import type { Prisma, Role } from "@/generated/prisma/client";

const PAGE_SIZE = 20;
const VALID_ROLES = ["CUSTOMER", "BUSINESS_OWNER", "ADMIN"];

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; rol?: string; sayfa?: string }>;
}) {
  const admin = await requireRole("ADMIN");
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const rol = VALID_ROLES.includes(params.rol ?? "") ? (params.rol as string) : "";
  const page = Math.max(1, Number(params.sayfa) || 1);

  const where: Prisma.UserWhereInput = {};
  if (q) where.OR = [{ name: { contains: q } }, { email: { contains: q } }];
  if (rol) where.role = rol as Role;

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        business: { select: { id: true, name: true } },
        _count: { select: { appointments: true, reviews: true } },
      },
    }),
  ]);

  const rows = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    active: u.active,
    createdAtLabel: format(u.createdAt, "d MMM yyyy", { locale: tr }),
    business: u.business,
    appointmentCount: u._count.appointments,
    reviewCount: u._count.reviews,
  }));

  return (
    <div>
      <PageHeader
        title="Kullanıcılar"
        description="Platformdaki tüm müşteri, işletme sahibi ve admin hesaplarını yönetin."
      />
      <UsersFilterBar q={q} rol={rol} />
      <UsersTable users={rows} currentUserId={admin.id} />
      <Pager basePath="/admin/kullanicilar" params={{ q, rol }} page={page} pageSize={PAGE_SIZE} total={total} />
    </div>
  );
}
