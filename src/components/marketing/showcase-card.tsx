import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, Star } from "lucide-react";
import { BUSINESS_TYPE_LABELS } from "@/lib/business-types";
import type { BusinessCard } from "@/lib/data/business";

export function ShowcaseCard({ business }: { business: BusinessCard }) {
  return (
    <Link
      href={`/isletme/${business.slug}`}
      className="group block shrink-0 overflow-hidden rounded-[22px] bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_28px_-14px_rgba(0,0,0,0.18)] transition-shadow hover:shadow-[0_1px_2px_rgba(0,0,0,0.06),0_20px_36px_-16px_rgba(162,28,219,0.28)]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {business.coverImageUrl && (
          <Image
            src={business.coverImageUrl}
            alt={business.name}
            fill
            sizes="(max-width: 768px) 80vw, 320px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-black shadow-sm backdrop-blur">
          <Star className="size-3.5 fill-violet-600 text-violet-600" />
          {business.ratingAvg > 0 ? business.ratingAvg.toFixed(1) : "Yeni"}
          {business.ratingCount > 0 && (
            <span className="font-normal text-black/50">({business.ratingCount})</span>
          )}
        </div>
        <div className="absolute top-2.5 right-2.5 flex size-7 items-center justify-center rounded-full bg-white/95 text-black shadow-sm backdrop-blur">
          <Heart className="size-3.5" />
        </div>
      </div>

      <div className="space-y-1.5 p-4">
        <div className="flex items-center gap-1.5">
          <h3 className="line-clamp-1 font-semibold">{business.name}</h3>
          {business.verified && (
            <span className="shrink-0 rounded-full bg-violet-600 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white">
              PRO
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3.5" />
          <span className="line-clamp-1">
            {business.city ?? BUSINESS_TYPE_LABELS[business.type as keyof typeof BUSINESS_TYPE_LABELS]}
          </span>
        </div>
        <p className="text-sm text-black/70 dark:text-white/70">
          {business.startingPrice !== null ? (
            <>
              <span className="font-semibold text-foreground">{business.startingPrice}₺&apos;dan</span> · Randevu ile
            </>
          ) : (
            "Randevu ile"
          )}
        </p>
      </div>
    </Link>
  );
}
