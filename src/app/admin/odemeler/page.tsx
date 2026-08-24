import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { CreditCard } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { PageHeader } from "@/components/admin/page-header";
import { PaymentsFilterBar } from "@/components/admin/payments-filter-bar";
import { Pager } from "@/components/admin/pager";
import { EmptyState } from "@/components/admin/empty-state";
import { Price } from "@/components/admin/price";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PaymentStatus, Prisma } from "@/generated/prisma/client";

const PAGE_SIZE = 50;
const VALID_STATUSES = ["PENDING", "SUCCEEDED", "FAILED", "REFUNDED"];

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Bekliyor",
  SUCCEEDED: "Başarılı",
  FAILED: "Başarısız",
  REFUNDED: "İade Edildi",
};

const STATUS_VARIANTS: Record<string, "secondary" | "outline" | "destructive"> = {
  PENDING: "outline",
  SUCCEEDED: "secondary",
  FAILED: "destructive",
  REFUNDED: "outline",
};

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ durum?: string; sayfa?: string }>;
}) {
  await requireRole("ADMIN");
  const params = await searchParams;
  const durum = VALID_STATUSES.includes(params.durum ?? "") ? (params.durum as string) : "";
  const page = Math.max(1, Number(params.sayfa) || 1);

  const where: Prisma.PaymentWhereInput = {};
  if (durum) where.status = durum as PaymentStatus;

  const [total, payments] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        subscription: {
          include: {
            business: { select: { name: true } },
            plan: { select: { name: true } },
          },
        },
      },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Ödemeler"
        description="Abonelik ödemelerinin dökümünü görüntüleyin. Ödeme sağlayıcı entegrasyonu geliştirme aşamasında olduğu için bu kayıtlar geliştirme ortamı verilerini içerebilir."
      />
      <PaymentsFilterBar durum={durum} />
      <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>İşletme</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Tutar</TableHead>
              <TableHead>Sağlayıcı</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Tarih</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="text-sm font-medium">{p.subscription.business.name}</TableCell>
                <TableCell className="text-sm">{p.subscription.plan.name}</TableCell>
                <TableCell className="text-sm">
                  <Price amount={p.amount} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{p.provider}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANTS[p.status] ?? "outline"}>
                    {STATUS_LABELS[p.status] ?? p.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(p.createdAt, "d MMM yyyy HH:mm", { locale: tr })}
                </TableCell>
              </TableRow>
            ))}
            {payments.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState icon={CreditCard} title="Ödeme kaydı bulunamadı" />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Pager basePath="/admin/odemeler" params={{ durum }} page={page} pageSize={PAGE_SIZE} total={total} />
    </div>
  );
}
