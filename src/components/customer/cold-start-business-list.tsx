import type { BusinessCard as BusinessCardData } from "@/lib/data/business";
import { BusinessGrid } from "./business-grid";

// With too few businesses overall, three near-identical horizontal rows read as
// broken/empty. A single dense list + the category filter above it reads as full.
export function ColdStartBusinessList({
  businesses,
  favoriteIds,
  isLoggedIn,
}: {
  businesses: BusinessCardData[];
  favoriteIds: Set<string>;
  isLoggedIn: boolean;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Tüm Salonlar</h2>
        <span className="text-sm text-muted-foreground">{businesses.length} salon</span>
      </div>
      <BusinessGrid
        businesses={businesses}
        favoriteIds={favoriteIds}
        isLoggedIn={isLoggedIn}
        sortByDistance
        emptyMessage="Henüz salon eklenmedi."
      />
    </section>
  );
}
