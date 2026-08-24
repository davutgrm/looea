"use client";

import { useEffect } from "react";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { spaceGrotesk } from "@/lib/fonts";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={`${spaceGrotesk.variable} flex min-h-dvh items-center justify-center bg-background px-6 py-16`}>
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <Link href="/" className="font-grotesk inline-flex items-center gap-1.5 text-xl font-bold tracking-tight">
          Kuafi
          <span className="size-1.5 rounded-full bg-app-accent" />
        </Link>

        <div className="mt-10 flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <TriangleAlert className="size-6" />
        </div>

        <h1 className="font-grotesk mt-6 text-3xl font-bold tracking-tight text-balance">
          Bir şeyler ters gitti.
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Beklenmedik bir hata oluştu. Tekrar dene ya da ana sayfaya dön.
        </p>

        <div className="mt-8 flex items-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center rounded-full bg-app-accent px-6 py-2.5 text-sm font-semibold text-app-accent-foreground transition-colors hover:bg-app-accent/90"
          >
            Tekrar dene
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-border px-6 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
          >
            Ana sayfa
          </Link>
        </div>
      </div>
    </div>
  );
}
