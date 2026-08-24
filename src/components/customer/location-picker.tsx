"use client";

import { MapPin, LocateFixed } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLocation } from "./location-provider";

const PRESETS: { label: string; lat: number; lng: number }[] = [
  { label: "İstanbul, Kadıköy", lat: 40.9903, lng: 29.0275 },
  { label: "İstanbul, Beşiktaş", lat: 41.0422, lng: 29.0061 },
  { label: "İstanbul, Şişli", lat: 41.0602, lng: 28.9877 },
  { label: "İstanbul, Üsküdar", lat: 41.0226, lng: 29.0159 },
];

export function LocationPicker() {
  const { label, setManualLocation, requestGeolocation, loading } = useLocation();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 px-2 text-sm font-medium">
          <MapPin className="size-4 text-app-accent" />
          <span className="max-w-[140px] truncate">{loading ? "Konum alınıyor..." : label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-2">
        <button
          type="button"
          onClick={requestGeolocation}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-accent"
        >
          <LocateFixed className="size-4 text-app-accent" />
          Konumumu kullan
        </button>
        <div className="my-1 border-t" />
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => setManualLocation(p.label, { lat: p.lat, lng: p.lng })}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-accent"
          >
            <MapPin className="size-4 text-muted-foreground" />
            {p.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
