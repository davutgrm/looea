"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";

export function HeroSearch() {
  const router = useRouter();
  const [mode, setMode] = useState<"salon" | "evde">("salon");
  const [service, setService] = useState("");
  const [city, setCity] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (mode === "evde") return;
    const q = [service.trim(), city.trim()].filter(Boolean).join(" ");
    router.push(q ? `/ara?q=${encodeURIComponent(q)}` : "/ara");
  }

  return (
    <div className="mx-auto w-full max-w-2xl rounded-[28px] border border-black/5 bg-white p-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_32px_64px_-24px_rgba(139,92,246,0.25)] dark:border-white/10 dark:bg-neutral-900">
      <div className="flex justify-center gap-1 p-1.5">
        <button
          type="button"
          onClick={() => setMode("salon")}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
            mode === "salon" ? "bg-black text-white" : "text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white"
          }`}
        >
          Salonda
        </button>
        <button
          type="button"
          onClick={() => setMode("evde")}
          className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
            mode === "evde" ? "bg-black text-white" : "text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white"
          }`}
        >
          Evde
          <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[9px] font-bold text-violet-600 dark:bg-violet-500/20">
            YAKINDA
          </span>
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-stretch gap-1 rounded-[20px] bg-secondary/60 p-1.5 sm:flex-row sm:items-center"
      >
        <div className="flex flex-1 items-center gap-2.5 px-3.5 py-2.5">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            type="text"
            value={service}
            onChange={(e) => setService(e.target.value)}
            placeholder={mode === "salon" ? "Hangi hizmet? (örn. saç kesimi)" : "Evde hizmet — yakında"}
            disabled={mode === "evde"}
            className="h-6 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
          />
        </div>

        <div className="hidden h-6 w-px bg-black/10 sm:block dark:bg-white/10" />

        <div className="flex flex-1 items-center gap-2.5 px-3.5 py-2.5">
          <MapPin className="size-4 shrink-0 text-muted-foreground" />
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Hangi şehir?"
            disabled={mode === "evde"}
            className="h-6 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
          />
        </div>

        <button
          type="submit"
          disabled={mode === "evde"}
          className="h-11 shrink-0 rounded-full bg-violet-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Ara
        </button>
      </form>
    </div>
  );
}
