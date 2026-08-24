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

export default async function MusterilerPage() {
  const { businessId } = await requireBusiness();

  const customerAgg = await prisma.appointment.groupBy({
    by: ["customerId"],
    where: { businessId },
    _count: { customerId: true },
    _max: { date: true },
    orderBy: { _max: { date: "desc" } },
  });

  const customerIds = customerAgg.map((c) => c.customerId);
  const users = await prisma.user.findMany({
    where: { id: { in: customerIds } },
    select: { id: true, name: true, email: true, phone: true, avatarUrl: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  const rows = customerAgg
    .map((c) => ({
      user: userMap.get(c.customerId),
      count: c._count.customerId,
      lastVisit: c._max.date,
    }))
    .filter((r): r is { user: NonNullable<typeof r.user>; count: number; lastVisit: Date | null } => !!r.user);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Müşteriler" />

      <Card>
        <CardHeader>
          <span className="text-sm text-muted-foreground">{rows.length} müşteri</span>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Henüz müşterin yok"
              description="Randevu alan müşteriler burada listelenecek."
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar size="sm">
                            {r.user.avatarUrl ? <AvatarImage src={r.user.avatarUrl} alt={r.user.name} /> : null}
                            <AvatarFallback className="bg-app-accent-soft text-app-accent-soft-foreground">
                              {r.user.name.slice(0, 1).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{r.user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs text-muted-foreground">
                          <span>{r.user.email}</span>
                          {r.user.phone ? <span>{r.user.phone}</span> : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{r.count}</Badge>
                      </TableCell>
                      <TableCell>
                        {r.lastVisit ? format(r.lastVisit, "d MMMM yyyy", { locale: tr }) : "—"}
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
