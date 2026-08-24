import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type SetupItem = { label: string; done: boolean; href: string };

export function SetupChecklist({ items }: { items: SetupItem[] }) {
  const doneCount = items.filter((i) => i.done).length;
  if (doneCount === items.length) return null;
  const pct = Math.round((doneCount / items.length) * 100);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-grotesk text-base font-bold">Başlangıç</h2>
        <span className="text-sm font-medium text-muted-foreground">
          {doneCount}/{items.length}
        </span>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-app-accent transition-all" style={{ width: `${pct}%` }} />
      </div>
      <ul className="mt-3 flex flex-col gap-0.5">
        {items.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm transition-colors hover:bg-muted"
            >
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full border",
                  item.done ? "border-app-accent bg-app-accent text-app-accent-foreground" : "border-border",
                )}
              >
                {item.done ? <Check className="size-3" /> : null}
              </span>
              <span className={cn("flex-1", item.done ? "text-muted-foreground line-through" : "font-medium")}>
                {item.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
