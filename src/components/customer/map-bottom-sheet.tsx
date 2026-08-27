import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, X } from "lucide-react";
import { formatDistance } from "@/lib/maps/distance";
import { getBusinessPath, getBusinessBookingPath } from "@/lib/business-url";
import type { BusinessCard as BusinessCardData } from "@/lib/data/business";
import { Button } from "@/components/ui/button";

export function MapBottomSheet({ business, onClose }: { business: BusinessCardData; onClose: () => void }) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-[1000] p-3">
      <div className="flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-lg">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted">
          {business.logoUrl ? (
            <Image src={business.logoUrl} alt={business.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-lg font-bold text-muted-foreground">
              {business.name[0]}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{business.name}</p>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-0.5 font-medium text-foreground">
              <Star className="size-3.5 fill-app-accent text-app-accent" />
              {business.ratingAvg > 0 ? business.ratingAvg.toFixed(1) : "Yeni"}
            </span>
            {business.distanceKm !== null && (
              <span className="flex items-center gap-0.5">
                <MapPin className="size-3.5" /> {formatDistance(business.distanceKm)}
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Kapat"
          className="shrink-0 rounded-full p-1.5 text-muted-foreground hover:bg-muted"
        >
          <X className="size-4" />
        </button>
      </div>
      <div className="mt-2 flex gap-2">
        <Button variant="outline" className="flex-1 bg-card" asChild>
          <Link href={getBusinessPath(business)}>Profili Gör</Link>
        </Button>
        <Button variant="accent" className="flex-1" asChild>
          <Link href={getBusinessBookingPath(business)}>Randevu Al</Link>
        </Button>
      </div>
    </div>
  );
}
