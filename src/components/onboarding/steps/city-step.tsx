"use client";

import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TURKISH_CITIES } from "@/lib/turkish-cities";

function normalize(value: string) {
  return value.trim().toLocaleLowerCase("tr-TR");
}

export function CityStep({ value, onChange }: { value: string; onChange: (city: string) => void }) {
  const [query, setQuery] = useState(value);

  const suggestions = useMemo(() => {
    const q = normalize(query);
    if (!q) return [];
    return TURKISH_CITIES.filter((c) => normalize(c).startsWith(q)).slice(0, 6);
  }, [query]);

  const isConfirmed = value !== "" && normalize(value) === normalize(query);

  function select(city: string) {
    setQuery(city);
    onChange(city);
  }

  return (
    <div>
      <Input
        value={query}
        placeholder="Şehrini yaz..."
        onChange={(e) => {
          setQuery(e.target.value);
          onChange("");
        }}
        className="h-12 text-base focus-visible:border-app-accent focus-visible:ring-app-accent/50"
      />
      {!isConfirmed && suggestions.length > 0 && (
        <div className="mt-2 flex flex-col gap-0.5 rounded-xl border border-border bg-card p-1.5">
          {suggestions.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => select(c)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted"
            >
              <MapPin className="size-3.5 text-muted-foreground" />
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
