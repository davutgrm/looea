"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Check, X, CheckCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateAppointmentStatus } from "@/lib/actions/business";
import type { AppointmentStatus } from "@/generated/prisma/client";

export function AppointmentStatusActions({
  id,
  status,
  size = "sm",
}: {
  id: string;
  status: AppointmentStatus;
  size?: "sm" | "xs";
}) {
  const [isPending, startTransition] = useTransition();

  function run(next: AppointmentStatus, confirmMessage?: string) {
    if (confirmMessage && !confirm(confirmMessage)) return;
    startTransition(async () => {
      const result = await updateAppointmentStatus(id, next);
      if (result.success) {
        toast.success("Randevu durumu güncellendi");
      } else {
        toast.error(result.error);
      }
    });
  }

  if (status === "COMPLETED" || status === "CANCELLED" || status === "NO_SHOW") {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {status === "PENDING" && (
        <Button size={size} variant="accent" disabled={isPending} onClick={() => run("CONFIRMED")}>
          <Check /> Onayla
        </Button>
      )}
      <Button size={size} variant="secondary" disabled={isPending} onClick={() => run("COMPLETED")}>
        <CheckCheck /> Tamamlandı
      </Button>
      <Button
        size={size}
        variant="outline"
        disabled={isPending}
        onClick={() => run("NO_SHOW", "Müşterinin gelmediğini onaylıyor musunuz?")}
      >
        <UserX /> No-show
      </Button>
      <Button
        size={size}
        variant="destructive"
        disabled={isPending}
        onClick={() => run("CANCELLED", "Bu randevuyu iptal etmek istediğinize emin misiniz?")}
      >
        <X /> İptal Et
      </Button>
    </div>
  );
}
