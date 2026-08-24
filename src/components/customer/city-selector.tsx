"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const CITIES = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Konya", "Gaziantep"];

export function CitySelector({ className }: { className?: string }) {
  const router = useRouter();
  const [city, setCity] = useState("İstanbul");

  function selectCity(next: string) {
    setCity(next);
    if (next !== "İstanbul") router.push(`/ara?q=${encodeURIComponent(next)}`);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-full border bg-card px-4 py-2 text-sm font-semibold shadow-sm transition-colors hover:border-app-accent",
            className,
          )}
        >
          {city}
          <ChevronDown className="size-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {CITIES.map((c) => (
          <DropdownMenuItem key={c} onClick={() => selectCity(c)}>
            {c}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
