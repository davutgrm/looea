import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, BadgeCheck } from "lucide-react";
import { BUSINESS_TYPE_LABELS } from "@/lib/business-types";
import { formatDistance } from "@/lib/maps/distance";
import type { BusinessCard as BusinessCardData } from "@/lib/data/business";
import { getBusinessPath } from "@/lib/business-url";
import { FavoriteButton } from "./favorite-button";
import { Price } from "./price";

export function BusinessCard({
  business,
  isFavorite = false,
  isLoggedIn = false,
  nextAvailableLabel,
}: {
  business: BusinessCardData;
  isFavorite?: boolean;
  isLoggedIn?: boolean;
  nextAvailableLabel?: string | null;
}) {
  return (
    <Link
      href={getBusinessPath(business)}
      className="group block overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {business.coverImageUrl && (
          <Image
            src={business.coverImageUrl}
            alt={business.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <FavoriteButton
          businessId={business.id}
          initialFavorite={isFavorite}
          isLoggedIn={isLoggedIn}
          className="absolute right-2 top-2"
        />
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {business.verified && (
            <div className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium text-app-accent shadow-sm dark:bg-black/60">
              <BadgeCheck className="size-3.5" /> Onaylı
            </div>
          )}
          {business.availableNow && (
            <div className="rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium shadow-sm dark:bg-black/60">
              🟢 Şu an müsait
            </div>
          )}
        </div>
      </div>

      <div className="space-y-1.5 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-semibold">{business.name}</h3>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-0.5 font-medium text-foreground">
            <Star className="size-3.5 fill-app-accent text-app-accent" />
            {business.ratingAvg > 0 ? business.ratingAvg.toFixed(1) : "Yeni"}
            {business.ratingCount > 0 && <span className="text-muted-foreground">({business.ratingCount})</span>}
          </span>
          {business.distanceKm !== null && (
            <span className="flex items-center gap-0.5">
              <MapPin className="size-3.5" /> {formatDistance(business.distanceKm)}
            </span>
          )}
        </div>

        <p className="line-clamp-1 text-xs text-muted-foreground">
          {BUSINESS_TYPE_LABELS[business.type as keyof typeof BUSINESS_TYPE_LABELS] ?? business.type}
        </p>

        <div className="flex items-center justify-between pt-1 text-sm">
          {business.startingPrice !== null ? (
            <span className="font-medium">
              <Price amount={business.startingPrice} />
              <span className="text-xs text-muted-foreground">&apos;dan</span>
            </span>
          ) : (
            <span />
          )}
        </div>

        {nextAvailableLabel && (
          <div className="flex items-center gap-1 pt-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-500" /> {nextAvailableLabel}
          </div>
        )}
      </div>
    </Link>
  );
}
