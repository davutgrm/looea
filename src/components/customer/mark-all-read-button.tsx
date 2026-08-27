"use client";

import { useTransition } from "react";
import { CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markAllNotificationsRead } from "@/lib/actions/customer";

export function MarkAllReadButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={() => startTransition(async () => { await markAllNotificationsRead(); })}
      className="gap-1.5 text-app-accent hover:text-app-accent"
    >
      <CheckCheck className="size-4" /> Tümünü okundu işaretle
    </Button>
  );
}
