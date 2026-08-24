"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { changeSubscriptionPlan } from "@/lib/actions/business";
import { Price } from "@/components/business/price";

export type PlanRow = {
  id: string;
  name: string;
  price: number;
  billingPeriod: string;
  features: string[];
};

export function PlanSelector({ plans, currentPlanId }: { plans: PlanRow[]; currentPlanId: string | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const plan = plans[0];
  if (!plan) return null;

  const isCurrent = plan.id === currentPlanId;

  function handleSelect() {
    startTransition(async () => {
      const result = await changeSubscriptionPlan(plan.id);
      if (result.success) {
        if (result.data.redirectUrl) {
          window.location.href = result.data.redirectUrl;
          return;
        }
        toast.success("Plan güncellendi");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
        <CardDescription>Randevularını yönet, yeni müşteri kazan.</CardDescription>
        <div className="flex items-baseline gap-1 pt-1">
          <span className="font-grotesk text-2xl font-bold">
            <Price amount={plan.price} />
          </span>
          <span className="text-sm text-muted-foreground">
            / {plan.billingPeriod === "YEARLY" ? "yıl" : "ay"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {plan.features.map((f) => (
          <div key={f} className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 size-3.5 shrink-0 text-app-accent" />
            <span>{f}</span>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          variant={isCurrent ? "outline" : "accent"}
          disabled={isCurrent || isPending}
          onClick={handleSelect}
        >
          {isCurrent ? "Aktif Plan" : "Hemen Başla"}
        </Button>
      </CardFooter>
    </Card>
  );
}
