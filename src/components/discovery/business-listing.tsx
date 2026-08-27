import Link from "next/link";
import type { BusinessCard as BusinessCardData } from "@/lib/data/business";
import { BusinessGrid } from "@/components/customer/business-grid";

export function BusinessListing({
  title,
  subtitle,
  businesses,
  favoriteIds,
  isLoggedIn,
  districtLinks,
  emptyMessage = "Bu bölgede henüz salon eklenmedi. Yakında burada olacağız!",
}: {
  title: string;
  subtitle: string;
  businesses: BusinessCardData[];
  favoriteIds: Set<string>;
  isLoggedIn: boolean;
  districtLinks?: { label: string; href: string }[];
  emptyMessage?: string;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">{subtitle}</p>

      {districtLinks && districtLinks.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {districtLinks.map((d) => (
            <Link
              key={d.href}
              href={d.href}
              className="rounded-full border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              {d.label}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8">
        <BusinessGrid
          businesses={businesses}
          favoriteIds={favoriteIds}
          isLoggedIn={isLoggedIn}
          sortByDistance={false}
          emptyMessage={emptyMessage}
        />
      </div>
    </div>
  );
}
