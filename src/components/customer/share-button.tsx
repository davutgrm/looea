"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ShareButton({ title, className }: { title: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      aria-label="Paylaş"
      onClick={async () => {
        const url = window.location.href;
        if (navigator.share) {
          try {
            await navigator.share({ title, url });
          } catch {
            // user cancelled the native share sheet
          }
          return;
        }
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Bağlantı kopyalandı");
        setTimeout(() => setCopied(false), 1500);
      }}
      className={cn(
        "flex size-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-transform active:scale-90 dark:bg-black/60",
        className,
      )}
    >
      {copied ? <Check className="size-4 text-emerald-600" /> : <Share2 className="size-4 text-foreground/70" />}
    </button>
  );
}
