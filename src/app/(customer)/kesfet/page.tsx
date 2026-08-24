import { auth } from "@/auth";
import { getFeaturedBusinesses } from "@/lib/data/business";
import { getActiveCategories } from "@/lib/data/categories";
import { getFavoriteIds } from "@/lib/data/favorites";
import { CategoryChips } from "@/components/customer/category-chips";
import { DiscoverRow } from "@/components/customer/discover-row";

export default async function DiscoverPage() {
  const session = await auth();
  const [categories, featured, favoriteIds] = await Promise.all([
    getActiveCategories(),
    getFeaturedBusinesses(null, 16),
    getFavoriteIds(),
  ]);

  const newest = [...featured].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const isLoggedIn = !!session?.user;

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-6">
      <CategoryChips categories={categories} />

      <DiscoverRow
        title="Öne Çıkanlar"
        emoji="🔥"
        viewAllHref="/ara?sirala=rating"
        businesses={featured}
        favoriteIds={favoriteIds}
        isLoggedIn={isLoggedIn}
      />

      <DiscoverRow
        title="Yeni Katılanlar"
        emoji="✨"
        viewAllHref="/ara"
        businesses={newest}
        favoriteIds={favoriteIds}
        isLoggedIn={isLoggedIn}
      />

      <DiscoverRow
        title="Yakınındakiler"
        emoji="📍"
        viewAllHref="/ara?sirala=distance"
        businesses={featured}
        favoriteIds={favoriteIds}
        isLoggedIn={isLoggedIn}
        sortByDistance
      />
    </div>
  );
}
