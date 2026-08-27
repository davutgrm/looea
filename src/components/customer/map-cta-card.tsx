import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";

/** Fills the trailing slot of a discover row with a call-to-action to the full map/list view. */
export function MapCtaCard({ href = "/ara" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="group flex aspect-[3/4] w-[280px] shrink-0 flex-col items-center justify-center gap-3 rounded-[22px] border border-dashed bg-app-accent-soft/40 p-5 text-center transition-colors hover:bg-app-accent-soft md:w-full md:shrink"
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-card shadow-sm">
        <MapPin className="size-5 text-app-accent" />
      </div>
      <div>
        <p className="font-semibold">Haritada Gör</p>
        <p className="mt-1 text-xs text-muted-foreground">Yakınındaki tüm salonlar</p>
      </div>
      <span className="flex items-center gap-1 text-xs font-medium text-app-accent">
        Keşfet <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
