"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareButton } from "./share-button";
import { FavoriteButton } from "./favorite-button";

export function BusinessStickyBar({
  businessId,
  bookingPath,
  businessName,
  isFavorite,
  isLoggedIn,
}: {
  businessId: string;
  bookingPath: string;
  businessName: string;
  isFavorite: boolean;
  isLoggedIn: boolean;
}) {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-30 flex items-center gap-2 border-b bg-background/95 px-4 py-3 backdrop-blur sm:gap-3">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Geri"
        className="flex size-9 shrink-0 items-center justify-center rounded-full border bg-card shadow-sm transition-colors hover:bg-muted"
      >
        <ArrowLeft className="size-4" />
      </button>

      <p className="min-w-0 flex-1 truncate font-bold">{businessName}</p>

      <ShareButton
        title={businessName}
        className="static bg-transparent shadow-none dark:bg-transparent"
      />
      <FavoriteButton
        businessId={businessId}
        initialFavorite={isFavorite}
        isLoggedIn={isLoggedIn}
        className="static bg-transparent shadow-none dark:bg-transparent"
      />

      <Button variant="accent" size="sm" asChild>
        <Link href={bookingPath}>Randevu Al</Link>
      </Button>
    </div>
  );
}
