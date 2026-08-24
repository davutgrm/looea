import { notFound } from "next/navigation";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Scissors, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { PageHeader } from "@/components/admin/page-header";
import { BusinessDetailActions } from "@/components/admin/business-detail-actions";
import { BusinessEditForm } from "@/components/admin/business-edit-form";
import { EmptyState } from "@/components/admin/empty-state";
import { Price } from "@/components/admin/price";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BUSINESS_TYPE_LABELS } from "@/lib/business-types";

export default async function AdminBusinessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("ADMIN");
  const { id } = await params;

  const business = await prisma.business.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, email: true, phone: true } },
      location: true,
      services: {
        include: { category: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
      staff: { orderBy: { createdAt: "desc" } },
      subscription: { include: { plan: true } },
      _count: { select: { appointments: true, reviews: true } },
    },
  });

  if (!business) notFound();

  return (
    <div>
      <PageHeader
        title={business.name}
        description={`/${business.slug}`}
        action={
          <BusinessDetailActions
            businessId={business.id}
            businessName={business.name}
            initialVerified={business.verified}
            initialActive={business.active}
          />
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Badge variant="outline">{BUSINESS_TYPE_LABELS[business.type]}</Badge>
        <Badge variant={business.verified ? "default" : "outline"}>
          {business.verified ? "Doğrulanmış" : "Doğrulanmamış"}
        </Badge>
        <Badge variant={business.active ? "secondary" : "destructive"}>
          {business.active ? "Aktif" : "Askıda"}
        </Badge>
        {business.subscription && <Badge variant="secondary">{business.subscription.plan.name}</Badge>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent>
            <p className="text-xs text-muted-foreground">Puan</p>
            <p className="mt-1 font-heading text-xl font-semibold">
              {business.ratingAvg.toFixed(1)} ({business.ratingCount})
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-muted-foreground">Toplam Randevu</p>
            <p className="mt-1 font-heading text-xl font-semibold">{business._count.appointments}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-muted-foreground">Toplam Yorum</p>
            <p className="mt-1 font-heading text-xl font-semibold">{business._count.reviews}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>İşletme Bilgilerini Düzenle</CardTitle>
          </CardHeader>
          <CardContent>
            <BusinessEditForm
              businessId={business.id}
              initial={{
                name: business.name,
                type: business.type,
                phone: business.phone ?? "",
                email: business.email ?? "",
                instagram: business.instagram ?? "",
                website: business.website ?? "",
                description: business.description ?? "",
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sahibi &amp; Konum</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Sahibi</p>
              <p className="font-medium">{business.owner.name}</p>
              <p className="text-muted-foreground">{business.owner.email}</p>
              {business.owner.phone && <p className="text-muted-foreground">{business.owner.phone}</p>}
            </div>
            {business.location && (
              <div>
                <p className="text-xs text-muted-foreground">Adres</p>
                <p>{business.location.address}</p>
                <p className="text-muted-foreground">
                  {business.location.city}, {business.location.country}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground">Kayıt Tarihi</p>
              <p>{format(business.createdAt, "d MMMM yyyy", { locale: tr })}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Hizmetler ({business.services.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {business.services.length === 0 && (
              <EmptyState icon={Scissors} title="Henüz hizmet eklenmemiş" />
            )}
            {business.services.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between border-b border-border py-2 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{s.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {s.category.name} · {s.durationMinutes} dk
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-sm font-medium"><Price amount={s.price} /></span>
                  <Badge variant={s.active ? "secondary" : "outline"}>
                    {s.active ? "Aktif" : "Pasif"}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personel ({business.staff.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {business.staff.length === 0 && (
              <EmptyState icon={Users} title="Henüz personel eklenmemiş" />
            )}
            {business.staff.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between border-b border-border py-2 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{s.name}</p>
                  {s.title && <p className="truncate text-xs text-muted-foreground">{s.title}</p>}
                </div>
                <Badge variant={s.active ? "secondary" : "outline"}>{s.active ? "Aktif" : "Pasif"}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {business.subscription && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Abonelik</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-6 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Plan</p>
              <p className="font-medium">{business.subscription.plan.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Durum</p>
              <p className="font-medium">{business.subscription.status}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Dönem Başlangıcı</p>
              <p className="font-medium">
                {format(business.subscription.currentPeriodStart, "d MMM yyyy", { locale: tr })}
              </p>
            </div>
            {business.subscription.currentPeriodEnd && (
              <div>
                <p className="text-xs text-muted-foreground">Dönem Sonu</p>
                <p className="font-medium">
                  {format(business.subscription.currentPeriodEnd, "d MMM yyyy", { locale: tr })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
