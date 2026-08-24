import Link from "next/link";
import { ArrowRight, TriangleAlert } from "lucide-react";

export function ProfileIncompleteBanner({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 rounded-2xl bg-app-accent px-5 py-4 text-app-accent-foreground transition-colors hover:bg-app-accent/90"
    >
      <div className="flex items-center gap-3">
        <TriangleAlert className="size-5 shrink-0" />
        <div>
          <p className="text-sm font-semibold">Profilini tamamla</p>
          <p className="text-xs text-app-accent-foreground/80">Müşteriler seni bulamıyor</p>
        </div>
      </div>
      <ArrowRight className="size-5 shrink-0" />
    </Link>
  );
}
