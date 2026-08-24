import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Pager({
  basePath,
  params,
  page,
  pageSize,
  total,
}: {
  basePath: string;
  params: Record<string, string | undefined>;
  page: number;
  pageSize: number;
  total: number;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function buildHref(p: number) {
    const sp = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) sp.set(key, value);
    }
    sp.set("sayfa", String(p));
    return `${basePath}?${sp.toString()}`;
  }

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-xl bg-card px-4 py-3 text-sm text-muted-foreground ring-1 ring-foreground/10 sm:flex-row sm:items-center sm:justify-between">
      <p>
        Toplam <span className="font-medium text-foreground">{total}</span> kayıt · Sayfa {page}/
        {totalPages}
      </p>
      <div className="flex gap-2">
        {page <= 1 ? (
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft />
            Önceki
          </Button>
        ) : (
          <Button asChild variant="outline" size="sm">
            <Link href={buildHref(page - 1)}>
              <ChevronLeft />
              Önceki
            </Link>
          </Button>
        )}
        {page >= totalPages ? (
          <Button variant="outline" size="sm" disabled>
            Sonraki
            <ChevronRight />
          </Button>
        ) : (
          <Button asChild variant="outline" size="sm">
            <Link href={buildHref(page + 1)}>
              Sonraki
              <ChevronRight />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
