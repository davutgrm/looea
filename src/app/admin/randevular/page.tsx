import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { PageHeader } from "@/components/admin/page-header";
import { AppointmentsFilterBar } from "@/components/admin/appointments-filter-bar";
import { Pager } from "@/components/admin/pager";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { APPOINTMENT_STATUS_LABELS } from "@/lib/business-types";
import type { AppointmentStatus, Prisma } from "@/generated/prisma/client";

const PAGE_SIZE = 50;
const VALID_STATUSES = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"];

export default async function AdminAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    baslangic?: string;
    bitis?: string;
    isletme?: string;
    musteri?: string;
    durum?: string;
    sayfa?: string;
  }>;
}) {
  await requireRole("ADMIN");
  const params = await searchParams;
  const baslangic = params.baslangic ?? "";
  const bitis = params.bitis ?? "";
  const isletme = params.isletme?.trim() ?? "";
  const musteri = params.musteri?.trim() ?? "";
  const durum = VALID_STATUSES.includes(params.durum ?? "") ? (params.durum as string) : "";
  const page = Math.max(1, Number(params.sayfa) || 1);

  const where: Prisma.AppointmentWhereInput = {};
  const dateFilter: Prisma.DateTimeFilter<"Appointment"> = {};
  if (baslangic) dateFilter.gte = new Date(baslangic);
  if (bitis) dateFilter.lte = new Date(bitis);
  if (baslangic || bitis) where.date = dateFilter;
  if (isletme) where.business = { name: { contains: isletme } };
  if (musteri) where.customer = { OR: [{ name: { contains: musteri } }, { email: { contains: musteri } }] };
  if (durum) where.status = durum as AppointmentStatus;

  const [total, appointments] = await Promise.all([
    prisma.appointment.count({ where }),
    prisma.appointment.findMany({
      where,
      orderBy: { date: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        business: { select: { name: true } },
        customer: { select: { name: true, email: true } },
        service: { select: { name: true } },
      },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Randevular"
        description="Platform genelindeki tüm randevuları filtreleyerek inceleyin."
      />
      <AppointmentsFilterBar
        baslangic={baslangic}
        bitis={bitis}
        isletme={isletme}
        musteri={musteri}
        durum={durum}
      />
      <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarih</TableHead>
              <TableHead>Saat</TableHead>
              <TableHead>İşletme</TableHead>
              <TableHead>Müşteri</TableHead>
              <TableHead>Hizmet</TableHead>
              <TableHead>Ücret</TableHead>
              <TableHead>Durum</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="text-sm">{format(a.date, "d MMM yyyy", { locale: tr })}</TableCell>
                <TableCell className="text-sm">
                  {a.startTime}–{a.endTime}
                </TableCell>
                <TableCell className="text-sm">{a.business.name}</TableCell>
                <TableCell>
                  <p className="text-sm">{a.customer.name}</p>
                  <p className="text-xs text-muted-foreground">{a.customer.email}</p>
                </TableCell>
                <TableCell className="text-sm">{a.service.name}</TableCell>
                <TableCell className="text-sm">{a.price.toLocaleString("tr-TR")} ₺</TableCell>
                <TableCell>
                  <Badge variant="secondary">{APPOINTMENT_STATUS_LABELS[a.status]}</Badge>
                </TableCell>
              </TableRow>
            ))}
            {appointments.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  Randevu bulunamadı.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Pager
        basePath="/admin/randevular"
        params={{ baslangic, bitis, isletme, musteri, durum }}
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
      />
    </div>
  );
}
