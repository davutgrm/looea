"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { recordAppointmentPayment } from "@/lib/actions/business";
import type { PaymentMethod } from "@/generated/prisma/client";

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Nakit",
  CARD: "Kart",
  UNPAID: "Ödenmedi",
};

export function PaymentMethodControl({
  appointmentId,
  paymentMethod,
}: {
  appointmentId: string;
  paymentMethod: PaymentMethod | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(value: string) {
    startTransition(async () => {
      const result = await recordAppointmentPayment(appointmentId, value);
      if (result.success) {
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Select value={paymentMethod ?? undefined} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger size="sm" className="w-32">
        <SelectValue placeholder="Ödeme" />
      </SelectTrigger>
      <SelectContent>
        {(Object.entries(PAYMENT_METHOD_LABELS) as [PaymentMethod, string][]).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
