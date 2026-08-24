import { Info } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminSettingsPage() {
  const admin = await requireRole("ADMIN");

  const [totalCategories, totalPlans, totalAdmins] = await Promise.all([
    prisma.category.count({ where: { active: true } }),
    prisma.subscriptionPlan.count({ where: { active: true } }),
    prisma.user.count({ where: { role: "ADMIN", active: true } }),
  ]);

  return (
    <div>
      <PageHeader title="Ayarlar" description="Platform genel bilgileri ve yönetim hesabı." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Platform Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-muted-foreground">Platform Adı</span>
              <span className="font-medium">Kuafi</span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-muted-foreground">Aktif Kategori Sayısı</span>
              <span className="font-medium">{totalCategories}</span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-muted-foreground">Aktif Üyelik Planı Sayısı</span>
              <span className="font-medium">{totalPlans}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Aktif Admin Sayısı</span>
              <span className="font-medium">{totalAdmins}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Oturum Açan Yönetici</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-muted-foreground">Ad Soyad</span>
              <span className="font-medium">{admin.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{admin.email}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardContent className="flex gap-3">
          <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Marka rengi, iletişim bilgileri, komisyon oranları ve bildirim tercihleri gibi
            değiştirilebilir platform genel ayarları, veri modeline özel bir ayarlar tablosu
            eklendiğinde bu sayfaya taşınacak. Kategori ve üyelik planı yönetimi zaten{" "}
            <strong>Kategoriler</strong> ve <strong>Üyelikler</strong> sayfalarından canlı olarak
            yapılabiliyor.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
