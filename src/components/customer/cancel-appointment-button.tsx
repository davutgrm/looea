"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cancelAppointment } from "@/lib/actions/customer";

export function CancelAppointmentButton({ appointmentId }: { appointmentId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() => {
        if (!confirm("Randevuyu iptal etmek istediğinize emin misiniz?")) return;
        startTransition(async () => {
          const res = await cancelAppointment(appointmentId);
          if (res.success) toast.success("Randevu iptal edildi");
          else toast.error(res.error);
        });
      }}
    >
      İptal Et
    </Button>
  );
}
