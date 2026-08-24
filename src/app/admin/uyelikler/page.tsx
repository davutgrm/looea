import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { CreditCard } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { PageHeader } from "@/components/admin/page-header";
import { PlansManager } from "@/components/admin/plans-manager";
import { EmptyState } from "@/components/admin/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function parseFeatures(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((f): f is string => typeof f === "string") : [];
  } catch {
    return [];
  }
}

export default async function AdminSubscriptionPlansPage() {
  await requireRole("ADMIN");

  const [plans, subscriptions] = await Promise.all([
    prisma.subscriptionPlan.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { subscriptions: true } } },
    }),
    prisma.subscription.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        business: { select: { id: true, name: true } },
        plan: { select: { name: true } },
      },
    }),
  ]);

  const planRows = plans.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    billingPeriod: p.billingPeriod,
    features: parseFeatures(p.features),
    order: p.order,
    active: p.active,
    subscriptionCount: p._count.subscriptions,
  }));

  const statusLabels: Record<string, string> = {
    ACTIVE: "Aktif",
    TRIAL: "Deneme",
    PAST_DUE: "Ödeme Gecikti",
    CANCELLED: "İptal Edildi",
    EXPIRED: "Süresi Doldu",
  };

  return (
    <div>
      <PageHeader
        title="Üyelikler"
        description="İşletmelere sunulan abonelik planlarını yönetin."
      />
      <PlansManager plans={planRows} />

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>İşletme Abonelikleri</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">İşletme</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Dönem Başlangıcı</TableHead>
                <TableHead className="pr-4">Dönem Sonu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="pl-4">
                    <Link href={`/admin/isletmeler/${s.business.id}`} className="text-sm text-primary hover:underline">
                      {s.business.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm">{s.plan.name}</TableCell>
                  <TableCell>
                    <Badge variant={s.status === "ACTIVE" ? "secondary" : "outline"}>
                      {statusLabels[s.status] ?? s.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(s.currentPeriodStart, "d MMM yyyy", { locale: tr })}
                  </TableCell>
                  <TableCell className="pr-4 text-sm text-muted-foreground">
                    {s.currentPeriodEnd ? format(s.currentPeriodEnd, "d MMM yyyy", { locale: tr }) : "—"}
                  </TableCell>
                </TableRow>
              ))}
              {subscriptions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <EmptyState icon={CreditCard} title="Henüz abonelik bulunmuyor" />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
