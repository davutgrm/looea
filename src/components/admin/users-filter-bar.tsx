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

export function UsersFilterBar({ q, rol }: { q: string; rol: string }) {
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
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
      <form
        className="relative flex-1 sm:max-w-xs"
        onSubmit={(e) => {
          e.preventDefault();
          pushParams({ q: value });
        }}
      >
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="İsim veya email ara..."
          className="pl-8"
        />
      </form>
      <Select value={rol || "all"} onValueChange={(v) => pushParams({ rol: v === "all" ? "" : v })}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Tüm roller" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tüm roller</SelectItem>
          <SelectItem value="CUSTOMER">Müşteri</SelectItem>
          <SelectItem value="BUSINESS_OWNER">İşletme Sahibi</SelectItem>
          <SelectItem value="ADMIN">Admin</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
