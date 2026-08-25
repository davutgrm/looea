"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ClientSegment } from "@/lib/guest-segment";

export function GuestSegmentSwitcher({
  value,
  onChange,
}: {
  value: ClientSegment;
  onChange: (segment: ClientSegment) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as ClientSegment)}>
      <SelectTrigger
        size="sm"
        className="rounded-full border-none bg-app-accent-soft px-3 text-xs font-semibold text-app-accent-soft-foreground"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        <SelectItem value="MALE">Erkek</SelectItem>
        <SelectItem value="FEMALE">Kadın</SelectItem>
      </SelectContent>
    </Select>
  );
}
