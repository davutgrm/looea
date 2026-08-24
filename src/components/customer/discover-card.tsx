import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, BadgeCheck } from "lucide-react";
import { formatDistance } from "@/lib/maps/distance";
import type { BusinessCard as BusinessCardData } from "@/lib/data/business";
import { FavoriteButton } from "./favorite-button";

export function DiscoverCard({
  business,
  isFavorite = false,
  isLoggedIn = false,
}: {
  business: BusinessCardData;
  isFavorite?: boolean;
  isLoggedIn?: boolean;
}) {
  return (
    <Link
      href={`/isletme/${business.slug}`}
      className="group relative block aspect-[3/4] w-[280px] shrink-0 overflow-hidden rounded-[22px] bg-app-accent-soft shadow-sm"
    >
      {business.coverImageUrl && (
        <Image
          src={business.coverImageUrl}
          alt={business.name}
          fill
          sizes="280px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/45" />

      <div className="absolute top-3 left-3 flex flex-col items-start gap-1">
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
      <FavoriteButton
        businessId={business.id}
        initialFavorite={isFavorite}
        isLoggedIn={isLoggedIn}
        className="absolute top-3 right-3"
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-5 text-center">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-full bg-card shadow-lg ring-4 ring-white/85">
          {business.logoUrl ? (
            <Image src={business.logoUrl} alt="" fill sizes="64px" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xl font-bold text-muted-foreground">
              {business.name[0]}
            </div>
          )}
        </div>
        <h3 className="font-grotesk line-clamp-2 text-xl leading-tight font-bold text-white">{business.name}</h3>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 p-4">
        <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          <Star className="size-3.5 fill-white text-white" />
          {business.ratingAvg > 0 ? business.ratingAvg.toFixed(1) : "Yeni"}
          {business.ratingCount > 0 && <span className="font-medium text-white/80">({business.ratingCount})</span>}
        </span>
        {business.distanceKm !== null && (
          <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            <MapPin className="size-3.5" /> {formatDistance(business.distanceKm)}
          </span>
        )}
      </div>
    </Link>
  );
}
