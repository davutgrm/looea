"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function BusinessesFilterBar({
  q,
  aktif,
  dogrulanmis,
  plan,
  planOptions,
}: {
  q: string;
  aktif: string;
  dogrulanmis: string;
  plan: string;
  planOptions: { slug: string; name: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(q);

  function pushParams(next: Record<string, string>) {
    const sp = new URLSearchParams(searchParams.toString());
    for (const [key, val] of Object.entries(next)) {
      if (val) sp.set(key, val);
      else sp.delete(key);
    }
    sp.delete("sayfa");
    router.push(`${pathname}?${sp.toString()}`);
  }

  return (
    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
      <form
        className="relative flex-1 lg:max-w-xs"
        onSubmit={(e) => {
          e.preventDefault();
          pushParams({ q: value });
        }}
      >
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="İşletme veya sahibi ara..."
          className="pl-8"
        />
      </form>

      <div className="flex flex-wrap gap-3">
        <Select value={aktif || "all"} onValueChange={(v) => pushParams({ aktif: v === "all" ? "" : v })}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm durumlar</SelectItem>
            <SelectItem value="true">Aktif</SelectItem>
            <SelectItem value="false">Pasif</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={dogrulanmis || "all"}
          onValueChange={(v) => pushParams({ dogrulanmis: v === "all" ? "" : v })}
        >
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="Doğrulama" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Doğrulama (hepsi)</SelectItem>
            <SelectItem value="true">Doğrulanmış</SelectItem>
            <SelectItem value="false">Doğrulanmamış</SelectItem>
          </SelectContent>
        </Select>

        <Select value={plan || "all"} onValueChange={(v) => pushParams({ plan: v === "all" ? "" : v })}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm planlar</SelectItem>
            {planOptions.map((p) => (
              <SelectItem key={p.slug} value={p.slug}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
