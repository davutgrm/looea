import { auth } from "@/auth";
import { searchBusinesses, type BusinessSort } from "@/lib/data/business";
import { getActiveCategories } from "@/lib/data/categories";
import { getFavoriteIds } from "@/lib/data/favorites";
import { SearchView } from "@/components/customer/search-view";

const VALID_SORTS: BusinessSort[] = ["distance", "rating", "price", "soonest"];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kategori?: string; sirala?: string }>;
}) {
  const { q = "", kategori = "", sirala = "" } = await searchParams;
  const initialSort: BusinessSort = VALID_SORTS.includes(sirala as BusinessSort)
    ? (sirala as BusinessSort)
    : "distance";
  const [session, categories, favoriteIds, initialResults] = await Promise.all([
    auth(),
    getActiveCategories(),
    getFavoriteIds(),
    searchBusinesses({ query: q || undefined, categorySlug: kategori || undefined, sort: initialSort }),
  ]);

  return (
    <SearchView
      initialQuery={q}
      initialCategory={kategori}
      initialSort={initialSort}
      initialResults={initialResults}
      categories={categories}
      favoriteIds={favoriteIds}
      isLoggedIn={!!session?.user}
    />
  );
}
