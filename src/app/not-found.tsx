import Link from "next/link";
import { SearchX } from "lucide-react";
import { spaceGrotesk } from "@/lib/fonts";

export default function NotFound() {
  return (
    <div className={`${spaceGrotesk.variable} flex min-h-dvh items-center justify-center bg-background px-6 py-16`}>
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <Link href="/" className="font-grotesk inline-flex items-center gap-1.5 text-xl font-bold tracking-tight">
          Kuafi
          <span className="size-1.5 rounded-full bg-app-accent" />
        </Link>

        <div className="mt-10 flex size-14 items-center justify-center rounded-full bg-app-accent-soft text-app-accent-soft-foreground">
          <SearchX className="size-6" />
        </div>

        <h1 className="font-grotesk mt-6 text-3xl font-bold tracking-tight text-balance">
          Bu sayfa bulunamadı.
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Aradığın sayfa kaldırılmış ya da hiç var olmamış olabilir.
        </p>

        <Link
          href="/kesfet"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-app-accent px-6 py-2.5 text-sm font-semibold text-app-accent-foreground transition-colors hover:bg-app-accent/90"
        >
          Keşfet&apos;e dön
        </Link>
      </div>
    </div>
  );
}
