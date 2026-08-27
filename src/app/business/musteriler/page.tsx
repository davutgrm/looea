import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Users } from "lucide-react";
import { requireBusiness } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/business/page-header";
import { EmptyState } from "@/components/business/empty-state";
import { AddCustomerButton } from "@/components/business/add-customer-dialog";
import { WhatsAppButton } from "@/components/business/whatsapp-button";

type CustomerRow = {
  id: string;
  kind: "user" | "business";
  name: string;
  phone: string | null;
  email: string | null;
  avatarUrl: string | null;
  count: number;
  lastVisit: Date | null;
};

export default async function MusterilerPage() {
  const { businessId } = await requireBusiness();

  const [realAgg, businessAgg, businessCustomers] = await Promise.all([
    prisma.appointment.groupBy({
      by: ["customerId"],
      where: { businessId, customerId: { not: null } },
      _count: { customerId: true },
      _max: { date: true },
    }),
    prisma.appointment.groupBy({
      by: ["businessCustomerId"],
      where: { businessId, businessCustomerId: { not: null } },
      _count: { businessCustomerId: true },
      _max: { date: true },
    }),
    prisma.businessCustomer.findMany({ where: { businessId } }),
  ]);

  const userIds = realAgg.map((c) => c.customerId).filter((id): id is string => !!id);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true, phone: true, avatarUrl: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));
  const businessAggMap = new Map(businessAgg.map((b) => [b.businessCustomerId, b]));

  const realRows: CustomerRow[] = realAgg
    .map((c): CustomerRow | null => {
      const user = c.customerId ? userMap.get(c.customerId) : undefined;
      if (!user) return null;
      return {
        id: user.id,
        kind: "user",
        name: user.name,
        phone: user.phone,
        email: user.email,
        avatarUrl: user.avatarUrl,
        count: c._count.customerId,
        lastVisit: c._max.date,
      };
    })
    .filter((r): r is CustomerRow => !!r);

  const businessRows: CustomerRow[] = businessCustomers.map((c) => {
    const agg = businessAggMap.get(c.id);
    return {
      id: c.id,
      kind: "business" as const,
      name: c.name ?? "İsimsiz müşteri",
      phone: c.phone,
      email: c.email,
      avatarUrl: null,
      count: agg?._count.businessCustomerId ?? 0,
      lastVisit: agg?._max.date ?? null,
    };
  });

  const rows = [...realRows, ...businessRows].sort(
    (a, b) => (b.lastVisit?.getTime() ?? 0) - (a.lastVisit?.getTime() ?? 0),
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Müşteriler" action={<AddCustomerButton />} />

      <Card>
        <CardHeader>
          <span className="text-sm text-muted-foreground">{rows.length} müşteri</span>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Henüz müşterin yok"
              description="Randevu alan müşteriler ve eklediğin müşteriler burada listelenecek."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Müşteri</TableHead>
                    <TableHead>İletişim</TableHead>
                    <TableHead>Randevu Sayısı</TableHead>
                    <TableHead>Son Ziyaret</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={`${r.kind}-${r.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar size="sm">
                            {r.avatarUrl ? <AvatarImage src={r.avatarUrl} alt={r.name} /> : null}
                            <AvatarFallback className="bg-app-accent-soft text-app-accent-soft-foreground">
                              {r.name.slice(0, 1).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{r.name}</span>
                          {r.kind === "business" && (
                            <Badge variant="outline" className="text-[10px]">
                              Misafir
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs text-muted-foreground">
                          {r.email ? <span>{r.email}</span> : null}
                          {r.phone ? <span>{r.phone}</span> : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{r.count}</Badge>
                      </TableCell>
                      <TableCell>
                        {r.lastVisit ? format(r.lastVisit, "d MMMM yyyy", { locale: tr }) : "—"}
                      </TableCell>
                      <TableCell>
                        <WhatsAppButton phone={r.phone} message={`Merhaba ${r.name}, `} />
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
