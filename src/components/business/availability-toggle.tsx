"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { setAvailableNow } from "@/lib/actions/business";

export function AvailabilityToggle({ initialAvailable }: { initialAvailable: boolean }) {
  const [available, setAvailable] = useState(initialAvailable);
  const [isPending, startTransition] = useTransition();

  function handleChange(next: boolean) {
    setAvailable(next);
    startTransition(async () => {
      const result = await setAvailableNow(next);
      if (!result.success) {
        setAvailable(!next);
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-app-accent-soft text-app-accent-soft-foreground">
          <Sparkles className="size-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">Şu an Müsaitim</p>
          <p className="text-xs text-muted-foreground">Son dakika müşteri al</p>
        </div>
      </div>
      <Switch
        checked={available}
        onCheckedChange={handleChange}
        disabled={isPending}
        className="data-checked:bg-app-accent"
      />
    </div>
  );
}
