"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { List, MapIcon, Navigation, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { MapView } from "@/components/map/map-view";
import { BusinessCard } from "@/components/customer/business-card";
import { MapBottomSheet } from "@/components/customer/map-bottom-sheet";
import { useLocation } from "@/components/customer/location-provider";
import { EmptyState } from "@/components/customer/empty-state";
import { GuestSegmentGate } from "@/components/customer/guest-segment-gate";
import { GuestSegmentSwitcher } from "@/components/customer/guest-segment-switcher";
import type { MapBounds } from "@/lib/maps/types";
import type { Category, BusinessServes } from "@/generated/prisma/client";
import type { BusinessCard as BusinessCardData, BusinessSort } from "@/lib/data/business";
import { servesForSegment } from "@/lib/business-types";
import { useGuestSegment } from "@/lib/guest-segment";
import { searchBusinessesAction, getAvailabilityBadges } from "@/lib/actions/search";

const RADIUS_OPTIONS = [1, 5, 10, 25];
const RATING_OPTIONS = [3, 4, 4.5];
const PRICE_OPTIONS = [200, 500, 1000];

export function SearchView({
  initialQuery,
  initialCategory,
  initialSort = "distance",
  initialResults,
  categories,
  favoriteIds,
  isLoggedIn,
  serves,
}: {
  initialQuery: string;
  initialCategory: string;
  initialSort?: BusinessSort;
  initialResults: BusinessCardData[];
  categories: Category[];
  favoriteIds: Set<string>;
  isLoggedIn: boolean;
  serves?: BusinessServes[] | null;
}) {
  const { coords } = useLocation();
  const guest = useGuestSegment();
  const [view, setView] = useState<"list" | "map">("list");
  const [query] = useState(initialQuery);
  const [categorySlug, setCategorySlug] = useState(initialCategory);
  const [radiusKm, setRadiusKm] = useState<number | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [sort, setSort] = useState<BusinessSort>(initialSort);
  const [todayOnly, setTodayOnly] = useState(false);
  const [results, setResults] = useState(initialResults);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingBounds, setPendingBounds] = useState<MapBounds | null>(null);
  const [availability, setAvailability] = useState<Record<string, { date: Date; time: string } | null>>({});
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const runSearch = (bounds?: MapBounds) => {
    startTransition(async () => {
      const data = await searchBusinessesAction({
        query: query || undefined,
        categorySlug: categorySlug || undefined,
        origin: coords,
        radiusKm: bounds ? undefined : radiusKm ?? undefined,
        sort,
        bounds,
        serves,
        minRating: minRating ?? undefined,
        maxPrice: maxPrice ?? undefined,
      });
      setResults(data);
      setPendingBounds(null);
    });
  };

  useEffect(() => {
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorySlug, radiusKm, minRating, maxPrice, sort, coords?.lat, coords?.lng]);

  useEffect(() => {
    if (todayOnly && results.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- kicks off an async fetch; loading flag must flip before it resolves
      setAvailabilityLoading(true);
      getAvailabilityBadges(results.map((r) => r.id)).then((data) => {
        setAvailability(data);
        setAvailabilityLoading(false);
      });
    }
  }, [todayOnly, results]);

  const effectiveServes = isLoggedIn ? (serves ?? null) : servesForSegment(guest.segment);

  const displayed = useMemo(() => {
    let list = results;
    if (effectiveServes) list = list.filter((r) => effectiveServes.includes(r.serves));
    // Skip the todayOnly filter while badges are still loading — otherwise every
    // result briefly disappears (no availability entry yet) before popping back.
    if (todayOnly && !availabilityLoading) list = list.filter((r) => availability[r.id]);
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results, todayOnly, availability, availabilityLoading, effectiveServes]);

  const visibleCategories = useMemo(
    () => (effectiveServes ? categories.filter((c) => effectiveServes.includes(c.serves)) : categories),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categories, effectiveServes],
  );

  const mapCenter = coords ?? { lat: 40.9903, lng: 29.0275 };

  const markers = displayed
    .filter((b) => b.location)
    .map((b) => ({ id: b.id, position: b.location! }));

  const selectedBusiness = selectedId ? displayed.find((b) => b.id === selectedId) ?? null : null;

  if (!isLoggedIn && !guest.resolved) return null;
  if (!isLoggedIn && !guest.segment) return <GuestSegmentGate onSelect={guest.select} />;

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col md:h-[calc(100dvh-4rem)]">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
        <Select value={categorySlug || "all"} onValueChange={(v) => setCategorySlug(v === "all" ? "" : v)}>
          <SelectTrigger className="h-9 w-auto min-w-[140px]">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm kategoriler</SelectItem>
            {visibleCategories.map((c) => (
              <SelectItem key={c.id} value={c.slug}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={radiusKm ? String(radiusKm) : "any"}
          onValueChange={(v) => setRadiusKm(v === "any" ? null : Number(v))}
        >
          <SelectTrigger className="h-9 w-auto min-w-[110px]">
            <SelectValue placeholder="Mesafe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Tüm mesafeler</SelectItem>
            {RADIUS_OPTIONS.map((r) => (
              <SelectItem key={r} value={String(r)}>
                {r} km
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={minRating ? String(minRating) : "any"}
          onValueChange={(v) => setMinRating(v === "any" ? null : Number(v))}
        >
          <SelectTrigger className="h-9 w-auto min-w-[130px]">
            <SelectValue placeholder="Minimum puan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Tüm puanlar</SelectItem>
            {RATING_OPTIONS.map((r) => (
              <SelectItem key={r} value={String(r)}>
                {r}+ yıldız
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={maxPrice ? String(maxPrice) : "any"}
          onValueChange={(v) => setMaxPrice(v === "any" ? null : Number(v))}
        >
          <SelectTrigger className="h-9 w-auto min-w-[140px]">
            <SelectValue placeholder="Fiyat aralığı" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Tüm fiyatlar</SelectItem>
            {PRICE_OPTIONS.map((p) => (
              <SelectItem key={p} value={String(p)}>
                {p}<span className="font-sans">₺</span>&apos;ye kadar
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(v) => setSort(v as BusinessSort)}>
          <SelectTrigger className="h-9 w-auto min-w-[140px]">
            <SelectValue placeholder="Sırala" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="distance">En yakın</SelectItem>
            <SelectItem value="rating">En yüksek puan</SelectItem>
            <SelectItem value="price">En ucuz</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm">
          <Switch checked={todayOnly} onCheckedChange={setTodayOnly} id="today-only" />
          <label htmlFor="today-only" className="cursor-pointer select-none">
            Bugün müsait
          </label>
        </div>

        {!isLoggedIn && guest.segment && <GuestSegmentSwitcher value={guest.segment} onChange={guest.select} />}

        <div className="ml-auto flex items-center gap-1 rounded-full border p-1 md:hidden">
          <button
            onClick={() => setView("list")}
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium ${view === "list" ? "bg-app-accent text-app-accent-foreground" : ""}`}
          >
            <List className="size-3.5" /> Liste
          </button>
          <button
            onClick={() => setView("map")}
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium ${view === "map" ? "bg-app-accent text-app-accent-foreground" : ""}`}
          >
            <MapIcon className="size-3.5" /> Harita
          </button>
        </div>
      </div>

      <div className="grid flex-1 overflow-hidden md:grid-cols-2">
        {/* List */}
        <div className={`overflow-y-auto p-4 ${view === "map" ? "hidden md:block" : ""}`}>
          {(isPending || availabilityLoading) && (
            <p className="pb-2 text-xs text-muted-foreground">Aranıyor...</p>
          )}
          {displayed.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="Bu kriterlere uygun işletme bulunamadı"
              description="Farklı bir konum, kategori veya filtre dene."
              className="my-4"
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-2 xl:grid-cols-3">
              {displayed.map((b) => (
                <div
                  key={b.id}
                  onMouseEnter={() => setSelectedId(b.id)}
                  className={selectedId === b.id ? "rounded-2xl ring-2 ring-app-accent" : ""}
                >
                  <BusinessCard business={b} isFavorite={favoriteIds.has(b.id)} isLoggedIn={isLoggedIn} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div className={`relative ${view === "list" ? "hidden md:block" : ""}`}>
          <MapView
            center={mapCenter}
            markers={markers}
            selectedMarkerId={selectedId}
            onMarkerClick={setSelectedId}
            onBoundsChange={(bounds) => setPendingBounds(bounds)}
            className="h-full w-full"
          />
          {pendingBounds && (
            <div className="absolute left-1/2 top-4 -translate-x-1/2">
              <Button
                variant="accent"
                size="sm"
                className="shadow-lg"
                onClick={() => runSearch(pendingBounds)}
              >
                <Navigation className="size-3.5" /> Bu bölgede ara
              </Button>
            </div>
          )}
          {selectedBusiness && (
            <MapBottomSheet business={selectedBusiness} onClose={() => setSelectedId(null)} />
          )}
        </div>
      </div>
    </div>
  );
}
