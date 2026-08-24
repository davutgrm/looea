import Link from "next/link";
import Image from "next/image";
import { CalendarX } from "lucide-react";
import { requireUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { APPOINTMENT_STATUS_LABELS } from "@/lib/business-types";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CancelAppointmentButton } from "@/components/customer/cancel-appointment-button";
import { ReviewDialog } from "@/components/customer/review-dialog";
import { Price } from "@/components/customer/price";

const STATUS_VARIANT: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  CONFIRMED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  COMPLETED: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  CANCELLED: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
  NO_SHOW: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

export default async function MyAppointmentsPage() {
  const user = await requireUser();

  const appointments = await prisma.appointment.findMany({
    where: { customerId: user.id },
    include: {
      business: { select: { name: true, slug: true, coverImageUrl: true } },
      service: { select: { name: true } },
      staff: { select: { name: true } },
      review: { select: { id: true } },
    },
    orderBy: { date: "desc" },
  });

  const now = new Date();
  const upcoming = appointments.filter((a) => a.date >= new Date(now.toDateString()) && ["PENDING", "CONFIRMED"].includes(a.status));
  const past = appointments.filter((a) => a.status === "COMPLETED");
  const cancelled = appointments.filter((a) => ["CANCELLED", "NO_SHOW"].includes(a.status));

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-bold">Randevularım</h1>

      <Tabs defaultValue="upcoming" className="mt-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Yaklaşan</TabsTrigger>
          <TabsTrigger value="past">Geçmiş</TabsTrigger>
          <TabsTrigger value="cancelled">İptal</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-3">
          {upcoming.length === 0 ? (
            <EmptyState text="Henüz yaklaşan randevunuz yok." />
          ) : (
            upcoming.map((a) => (
              <AppointmentCard key={a.id} appointment={a} action={<CancelAppointmentButton appointmentId={a.id} />} />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-3">
          {past.length === 0 ? (
            <EmptyState text="Henüz geçmiş randevunuz yok." />
          ) : (
            past.map((a) => (
              <AppointmentCard
                key={a.id}
                appointment={a}
                action={!a.review && <ReviewDialog appointmentId={a.id} businessName={a.business.name} />}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-3">
          {cancelled.length === 0 ? (
            <EmptyState text="İptal edilmiş randevunuz yok." />
          ) : (
            cancelled.map((a) => <AppointmentCard key={a.id} appointment={a} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AppointmentCard({
  appointment,
  action,
}: {
  appointment: {
    id: string;
    date: Date;
    startTime: string;
    price: number;
    status: string;
    business: { name: string; slug: string; coverImageUrl: string | null };
    service: { name: string };
    staff: { name: string } | null;
  };
  action?: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border bg-card p-3 shadow-sm">
      <Link href={`/isletme/${appointment.business.slug}`} className="flex flex-1 gap-3">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
          {appointment.business.coverImageUrl && (
            <Image src={appointment.business.coverImageUrl} alt="" fill className="object-cover" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold">{appointment.business.name}</p>
            <Badge className={STATUS_VARIANT[appointment.status]} variant="secondary">
              {APPOINTMENT_STATUS_LABELS[appointment.status as keyof typeof APPOINTMENT_STATUS_LABELS]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {appointment.service.name}
            {appointment.staff && ` · ${appointment.staff.name}`}
          </p>
          <p className="text-sm text-muted-foreground">
            {appointment.date.toLocaleDateString("tr-TR", { day: "numeric", month: "long" })} · {appointment.startTime}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <p className="font-semibold"><Price amount={appointment.price} /></p>
          </div>
        </div>
      </Link>
      {action && <div className="flex shrink-0 items-end pb-0.5">{action}</div>}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center">
      <CalendarX className="size-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
