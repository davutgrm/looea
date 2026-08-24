import { cn } from "@/lib/utils";

export function SectionLabel({
  index,
  label,
  className,
  align = "left",
}: {
  index: string;
  label: string;
  className?: string;
  align?: "left" | "center";
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-xs font-semibold tracking-[0.25em] text-violet-600 uppercase",
        align === "center" && "justify-center",
        className,
      )}
    >
      <span>{index}</span>
      <span className="h-px w-6 bg-violet-600/50" />
      <span>{label}</span>
    </div>
  );
}

export function SectionNumeral({ n, className }: { n: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "font-grotesk pointer-events-none absolute top-0 text-[9rem] leading-none font-bold text-black/[0.03] select-none md:text-[13rem] dark:text-white/[0.03]",
        className,
      )}
    >
      {n}
    </span>
  );
}
