"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { APPOINTMENT_STATUS_LABELS } from "@/lib/business-types";

export function AppointmentsFilterBar({
  baslangic,
  bitis,
  isletme,
  musteri,
  durum,
}: {
  baslangic: string;
  bitis: string;
  isletme: string;
  musteri: string;
  durum: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ baslangic, bitis, isletme, musteri });

  function apply(next: Record<string, string>) {
    const sp = new URLSearchParams(searchParams.toString());
    for (const [key, val] of Object.entries(next)) {
      if (val) sp.set(key, val);
      else sp.delete(key);
    }
    sp.delete("sayfa");
    router.push(`${pathname}?${sp.toString()}`);
  }

  return (
    <form
      className="mb-4 grid grid-cols-1 gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:grid-cols-2 lg:grid-cols-5"
      onSubmit={(e) => {
        e.preventDefault();
        apply({ ...form, durum });
      }}
    >
      <div className="space-y-1">
        <Label htmlFor="baslangic" className="text-xs">
          Başlangıç
        </Label>
        <Input
          id="baslangic"
          type="date"
          value={form.baslangic}
          onChange={(e) => setForm((f) => ({ ...f, baslangic: e.target.value }))}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="bitis" className="text-xs">
          Bitiş
        </Label>
        <Input
          id="bitis"
          type="date"
          value={form.bitis}
          onChange={(e) => setForm((f) => ({ ...f, bitis: e.target.value }))}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="isletme" className="text-xs">
          İşletme
        </Label>
        <Input
          id="isletme"
          value={form.isletme}
          onChange={(e) => setForm((f) => ({ ...f, isletme: e.target.value }))}
          placeholder="İşletme adı"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="musteri" className="text-xs">
          Müşteri
        </Label>
        <Input
          id="musteri"
          value={form.musteri}
          onChange={(e) => setForm((f) => ({ ...f, musteri: e.target.value }))}
          placeholder="İsim veya email"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Durum</Label>
        <Select value={durum || "all"} onValueChange={(v) => apply({ ...form, durum: v === "all" ? "" : v })}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Tüm durumlar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm durumlar</SelectItem>
            {Object.entries(APPOINTMENT_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-end sm:col-span-2 lg:col-span-5">
        <Button type="submit" size="sm">
          Filtrele
        </Button>
      </div>
    </form>
  );
}
