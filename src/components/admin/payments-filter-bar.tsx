"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Bekliyor",
  SUCCEEDED: "Başarılı",
  FAILED: "Başarısız",
  REFUNDED: "İade Edildi",
};

export function PaymentsFilterBar({ durum }: { durum: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function apply(next: string) {
    const sp = new URLSearchParams(searchParams.toString());
    if (next) sp.set("durum", next);
    else sp.delete("durum");
    sp.delete("sayfa");
    router.push(`${pathname}?${sp.toString()}`);
  }

  return (
    <div className="mb-4">
      <Select value={durum || "all"} onValueChange={(v) => apply(v === "all" ? "" : v)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Durum" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tüm durumlar</SelectItem>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
