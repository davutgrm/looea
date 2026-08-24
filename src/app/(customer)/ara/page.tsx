import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { searchBusinesses, type BusinessSort } from "@/lib/data/business";
import { getActiveCategories } from "@/lib/data/categories";
import { getFavoriteIds } from "@/lib/data/favorites";
import { servesForSegment } from "@/lib/business-types";
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
  const session = await auth();
  const dbUser = session?.user
    ? await prisma.user.findUnique({ where: { id: session.user.id }, select: { segment: true } })
    : null;
  const serves = servesForSegment(dbUser?.segment);

  const [categories, favoriteIds, initialResults] = await Promise.all([
    getActiveCategories(),
    getFavoriteIds(),
    searchBusinesses({ query: q || undefined, categorySlug: kategori || undefined, sort: initialSort, serves }),
  ]);
  const visibleCategories = serves ? categories.filter((c) => serves.includes(c.serves)) : categories;

  return (
    <SearchView
      initialQuery={q}
      initialCategory={kategori}
      initialSort={initialSort}
      initialResults={initialResults}
      categories={visibleCategories}
      favoriteIds={favoriteIds}
      isLoggedIn={!!session?.user}
      serves={serves}
    />
  );
}
