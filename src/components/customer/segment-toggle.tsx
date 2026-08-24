"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Scissors, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateSegment } from "@/lib/actions/customer";

export function SegmentToggle({ value }: { value: "MALE" | "FEMALE" | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function select(segment: "MALE" | "FEMALE") {
    if (segment === value) return;
    startTransition(async () => {
      const result = await updateSegment({ segment });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Tercihin güncellendi");
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      <Option label="Erkek" icon={Scissors} active={value === "MALE"} disabled={isPending} onClick={() => select("MALE")} />
      <Option label="Kadın" icon={Sparkles} active={value === "FEMALE"} disabled={isPending} onClick={() => select("FEMALE")} />
    </div>
  );
}

function Option({
  label,
  icon: Icon,
  active,
  disabled,
  onClick,
}: {
  label: string;
  icon: typeof Scissors;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors disabled:opacity-60",
        active
          ? "border-app-accent bg-app-accent-soft text-app-accent-soft-foreground"
          : "border-border hover:border-app-accent/50",
      )}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}
