import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Category } from "@/generated/prisma/client";

export function CategoryChips({ categories }: { categories: Category[] }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <Link
        href="/ara"
        className="shrink-0 rounded-full bg-app-accent px-4 py-2 text-sm font-semibold whitespace-nowrap text-app-accent-foreground"
      >
        Tümü
      </Link>
      {categories.map((c) => (
        <Link
          key={c.id}
          href={`/ara?kategori=${c.slug}`}
          className={cn(
            "shrink-0 rounded-full border bg-card px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
            "hover:border-app-accent hover:text-app-accent",
          )}
        >
          {c.name}
        </Link>
      ))}
    </div>
  );
}
