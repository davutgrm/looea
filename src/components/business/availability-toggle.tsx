"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { setAvailableNow } from "@/lib/actions/business";

type Duration = "1H" | "2H" | "EOD";

const DURATION_OPTIONS: { value: Duration; label: string }[] = [
  { value: "1H", label: "1 saat" },
  { value: "2H", label: "2 saat" },
  { value: "EOD", label: "Gün sonu" },
];

export function AvailabilityToggle({ initialAvailable }: { initialAvailable: boolean }) {
  const [available, setAvailable] = useState(initialAvailable);
  const [awaitingDuration, setAwaitingDuration] = useState(false);
  const [isPending, startTransition] = useTransition();

  function apply(next: boolean, duration?: Duration) {
    setAvailable(next);
    setAwaitingDuration(false);
    startTransition(async () => {
      const result = await setAvailableNow(next, duration ?? null);
      if (!result.success) {
        setAvailable(!next);
        toast.error(result.error);
      }
    });
  }

  function handleChange(next: boolean) {
    if (next) {
      setAvailable(true);
      setAwaitingDuration(true);
      return;
    }
    apply(false);
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-4">
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

      {awaitingDuration && (
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <span className="text-xs text-muted-foreground">Ne kadar süreyle?</span>
          {DURATION_OPTIONS.map((opt) => (
            <Button key={opt.value} type="button" size="xs" variant="outline" onClick={() => apply(true, opt.value)}>
              {opt.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
