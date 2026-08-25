"use client";

import { SegmentStep } from "@/components/onboarding/steps/segment-step";
import type { ClientSegment } from "@/lib/guest-segment";

export function GuestSegmentGate({ onSelect }: { onSelect: (segment: ClientSegment) => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center">
      <h1 className="font-grotesk text-2xl font-bold tracking-tight text-balance sm:text-3xl">
        Hangi hizmetleri arıyorsun?
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">Sana en uygun işletmeleri gösterebilmemiz için.</p>
      <div className="mt-8 w-full">
        <SegmentStep value={null} onSelect={onSelect} />
      </div>
    </div>
  );
}
