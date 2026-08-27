"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { TR_PROVINCES, type Province } from "@/lib/turkey-locations";
import { cn } from "@/lib/utils";

// Own 81-il + ilçe dataset — deliberately not backed by an external
// POI/geocoder (which would surface unrelated businesses as suggestions).
export function CitySelector({ className }: { className?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [province, setProvince] = useState<Province | null>(null);
  const [query, setQuery] = useState("");

  const filteredProvinces = useMemo(() => {
    const q = query.toLocaleLowerCase("tr-TR");
    const matches = q ? TR_PROVINCES.filter((p) => p.name.toLocaleLowerCase("tr-TR").includes(q)) : TR_PROVINCES;
    return matches.slice(0, 20);
  }, [query]);

  const filteredDistricts = useMemo(() => {
    if (!province) return [];
    const q = query.toLocaleLowerCase("tr-TR");
    return q ? province.districts.filter((d) => d.name.toLocaleLowerCase("tr-TR").includes(q)) : province.districts;
  }, [province, query]);

  function reset(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setProvince(null);
      setQuery("");
    }
  }

  function goToDistrict(districtSlug: string) {
    if (!province) return;
    setOpen(false);
    router.push(`/kuafor/${province.slug}/${districtSlug}`);
  }

  function goToProvince(p: Province) {
    setOpen(false);
    router.push(`/kuafor/${p.slug}`);
  }

  return (
    <Popover open={open} onOpenChange={reset}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-full border bg-card px-4 py-2 text-sm font-semibold shadow-sm transition-colors hover:border-app-accent",
            className,
          )}
        >
          {province ? province.name : "İl / İlçe seç"}
          <ChevronDown className="size-4 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-2">
        <div className="relative mb-1.5">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={province ? `${province.name} içinde ilçe ara...` : "İl ara..."}
            className="h-8 pl-8 text-sm"
          />
        </div>
        {province && (
          <button
            type="button"
            onClick={() => {
              setProvince(null);
              setQuery("");
            }}
            className="mb-1 px-1 text-xs font-medium text-app-accent hover:underline"
          >
            ← Tüm iller
          </button>
        )}
        <div className="max-h-64 overflow-y-auto">
          {!province && filteredProvinces.length === 0 && (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">İl bulunamadı</p>
          )}
          {!province &&
            filteredProvinces.map((p) => (
              <button
                key={p.slug}
                type="button"
                onClick={() => setProvince(p)}
                className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm hover:bg-accent"
              >
                {p.name}
              </button>
            ))}
          {province && (
            <>
              <button
                type="button"
                onClick={() => goToProvince(province)}
                className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium text-app-accent hover:bg-accent"
              >
                Tüm {province.name}
              </button>
              {filteredDistricts.map((d) => (
                <button
                  key={d.slug}
                  type="button"
                  onClick={() => goToDistrict(d.slug)}
                  className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm hover:bg-accent"
                >
                  {d.name}
                </button>
              ))}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
