import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { CreditCard } from "lucide-react";
import { requireBusiness } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { PageHeader } from "@/components/business/page-header";
import { EmptyState } from "@/components/business/empty-state";
import { PlanSelector } from "@/components/business/plan-selector";
import { Price } from "@/components/business/price";
import { cn } from "@/lib/utils";
import type { SubscriptionStatus, PaymentStatus } from "@/generated/prisma/client";

const SUBSCRIPTION_STATUS_META: Record<SubscriptionStatus, { label: string; className: string }> = {
  ACTIVE: { label: "Aktif", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
  TRIAL: { label: "Deneme Süresi", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  PAST_DUE: { label: "Gecikmiş Ödeme", className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
  CANCELLED: { label: "İptal Edildi", className: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300" },
  EXPIRED: { label: "Süresi Doldu", className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
};

const PAYMENT_STATUS_META: Record<PaymentStatus, { label: string; className: string }> = {
  PENDING: { label: "Beklemede", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  SUCCEEDED: { label: "Başarılı", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
  FAILED: { label: "Başarısız", className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
  REFUNDED: { label: "İade Edildi", className: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300" },
};

export default async function UyelikPage() {
  const { businessId } = await requireBusiness();

  const [plans, subscription] = await Promise.all([
    prisma.subscriptionPlan.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
    prisma.subscription.findUnique({
      where: { businessId },
      include: { plan: true, payments: { orderBy: { createdAt: "desc" }, take: 20 } },
    }),
  ]);

  const planRows = plans.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    billingPeriod: p.billingPeriod,
    features: JSON.parse(p.features) as string[],
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Üyelik" />

      {subscription ? (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Mevcut Abonelik</CardTitle>
              <CardDescription>
                {subscription.plan.name} planı
                {subscription.currentPeriodEnd
                  ? ` · ${format(subscription.currentPeriodEnd, "d MMMM yyyy", { locale: tr })} tarihine kadar`
                  : ""}
              </CardDescription>
            </div>
            <Badge variant="secondary" className={cn(SUBSCRIPTION_STATUS_META[subscription.status].className)}>
              {SUBSCRIPTION_STATUS_META[subscription.status].label}
            </Badge>
          </CardHeader>
        </Card>
      ) : null}

      <PlanSelector plans={planRows} currentPlanId={subscription?.planId ?? null} />

      <Card>
        <CardHeader>
          <CardTitle>Ödeme Geçmişi</CardTitle>
        </CardHeader>
        <CardContent>
          {!subscription || subscription.payments.length === 0 ? (
            <EmptyState icon={CreditCard} title="Henüz ödeme kaydı yok" />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Sağlayıcı</TableHead>
                    <TableHead>Durum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscription.payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{format(p.createdAt, "d MMM yyyy HH:mm", { locale: tr })}</TableCell>
                      <TableCell>
                        <Price amount={p.amount} />
                      </TableCell>
                      <TableCell className="capitalize">{p.provider}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={cn(PAYMENT_STATUS_META[p.status].className)}>
                          {PAYMENT_STATUS_META[p.status].label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
