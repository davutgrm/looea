"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STATUS_TABS: { value: string; label: string }[] = [
  { value: "ALL", label: "Tümü" },
  { value: "CONFIRMED", label: "Onaylanan" },
  { value: "COMPLETED", label: "Tamamlanan" },
  { value: "PENDING", label: "Bekleyen" },
  { value: "CANCELLED", label: "İptal Edilen" },
];

export function AppointmentFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const status = searchParams.get("status") ?? "ALL";
  const date = searchParams.get("date") ?? "";

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "ALL") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex gap-1 overflow-x-auto border-b border-border [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {STATUS_TABS.map((tab) => {
          const active = status === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setParam("status", tab.value)}
              className={cn(
                "shrink-0 border-b-2 px-3.5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
                active
                  ? "border-app-accent text-app-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input type="date" value={date} onChange={(e) => setParam("date", e.target.value)} className="w-44" />
        {(status !== "ALL" || date) && (
          <Button variant="ghost" size="sm" onClick={() => router.push(pathname)}>
            Filtreleri Temizle
          </Button>
        )}
      </div>
    </div>
  );
}
