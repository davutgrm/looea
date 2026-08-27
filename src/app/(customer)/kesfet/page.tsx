import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getFeaturedBusinesses, getNewestBusinesses, getActiveBusinessCount, searchBusinesses } from "@/lib/data/business";
import { getActiveCategories } from "@/lib/data/categories";
import { getFavoriteIds } from "@/lib/data/favorites";
import { servesForSegment } from "@/lib/business-types";
import { CategoryChips } from "@/components/customer/category-chips";
import { DiscoverRow } from "@/components/customer/discover-row";
import { ColdStartBusinessList } from "@/components/customer/cold-start-business-list";
import { GuestKesfetView } from "@/components/customer/guest-kesfet-view";

// Below this total, three horizontal "rows" over the same handful of
// businesses read as broken rather than curated — collapse to one list.
const COLD_START_THRESHOLD = 15;
const NEARBY_RADIUS_KM = 25;

export default async function DiscoverPage() {
  const session = await auth();

  if (!session?.user) {
    const totalCount = await getActiveBusinessCount();
    const [categories, featured, all] = await Promise.all([
      getActiveCategories(),
      getFeaturedBusinesses(null, 16),
      totalCount < COLD_START_THRESHOLD ? searchBusinesses({ sort: "rating" }) : Promise.resolve(null),
    ]);
    const newest = [...featured].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return <GuestKesfetView categories={categories} featured={featured} newest={newest} allBusinesses={all} />;
  }

  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { segment: true } });
  const serves = servesForSegment(dbUser?.segment);

  const totalCount = await getActiveBusinessCount(serves);
  const isColdStart = totalCount < COLD_START_THRESHOLD;

  const [categories, favoriteIds] = await Promise.all([getActiveCategories(), getFavoriteIds()]);
  const visibleCategories = serves ? categories.filter((c) => serves.includes(c.serves)) : categories;

  if (isColdStart) {
    const all = await searchBusinesses({ serves, sort: "rating" });
    return (
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-6">
        <CategoryChips categories={visibleCategories} />
        <ColdStartBusinessList businesses={all} favoriteIds={favoriteIds} isLoggedIn />
      </div>
    );
  }

  const [featured, newest] = await Promise.all([
    getFeaturedBusinesses(null, 12, serves),
    getNewestBusinesses(12, serves),
  ]);
  const newestDeduped = newest.filter((b) => !featured.some((f) => f.id === b.id));

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-6">
      <CategoryChips categories={visibleCategories} />

      <DiscoverRow
        title="Öne Çıkanlar"
        emoji="🔥"
        viewAllHref="/ara?sirala=rating"
        businesses={featured}
        favoriteIds={favoriteIds}
        isLoggedIn
      />

      <DiscoverRow
        title="Yeni Katılanlar"
        emoji="✨"
        viewAllHref="/ara"
        businesses={newestDeduped}
        favoriteIds={favoriteIds}
        isLoggedIn
      />

      <DiscoverRow
        title="Yakınındakiler"
        emoji="📍"
        viewAllHref="/ara?sirala=distance"
        businesses={featured}
        favoriteIds={favoriteIds}
        isLoggedIn
        sortByDistance
        radiusKm={NEARBY_RADIUS_KM}
      />
    </div>
  );
}
