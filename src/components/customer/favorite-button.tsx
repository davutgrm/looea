"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { toggleFavorite } from "@/lib/actions/customer";

export function FavoriteButton({
  businessId,
  initialFavorite,
  isLoggedIn,
  className,
}: {
  businessId: string;
  initialFavorite: boolean;
  isLoggedIn: boolean;
  className?: string;
}) {
  const [favorite, setFavorite] = useState(initialFavorite);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label={favorite ? "Favorilerden çıkar" : "Favorilere ekle"}
      disabled={pending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isLoggedIn) {
          router.push("/giris");
          return;
        }
        setFavorite((f) => !f);
        startTransition(async () => {
          const res = await toggleFavorite(businessId);
          if (!res.success) {
            setFavorite((f) => !f);
            toast.error(res.error);
          }
        });
      }}
      className={cn(
        "flex size-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-transform active:scale-90 dark:bg-black/60",
        className,
      )}
    >
      <Heart className={cn("size-4 text-foreground/70", favorite && "fill-app-accent text-app-accent")} />
    </button>
  );
}
