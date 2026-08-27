import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/lib/date";
import { cn } from "@/lib/utils";

export function ReviewCard({
  name,
  avatarUrl,
  rating,
  comment,
  createdAt,
  className,
  clamp = false,
}: {
  name: string;
  avatarUrl?: string | null;
  rating: number;
  comment?: string | null;
  createdAt: Date;
  className?: string;
  /** Truncate long comments to 2 lines — only for tight preview contexts (e.g. sidebar). */
  clamp?: boolean;
}) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <Avatar className="size-9 shrink-0">
        <AvatarImage src={avatarUrl ?? undefined} />
        <AvatarFallback className="bg-app-accent-soft font-semibold text-app-accent-soft-foreground">
          {name[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{name}</p>
            <p className="text-xs text-muted-foreground">{formatRelativeTime(createdAt)}</p>
          </div>
          <div className="flex shrink-0 gap-0.5 pt-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`size-3 ${i < rating ? "fill-app-accent text-app-accent" : "text-muted"}`}
              />
            ))}
          </div>
        </div>
        {comment && (
          <p className={cn("mt-2 rounded-xl bg-muted/60 px-3 py-2 text-xs text-foreground", clamp && "line-clamp-2")}>
            {comment}
          </p>
        )}
      </div>
    </div>
  );
}
