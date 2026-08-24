import { Star } from "lucide-react";
import { requireBusiness } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { formatRelativeTime } from "@/lib/date";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageHeader } from "@/components/business/page-header";
import { StatRow } from "@/components/business/stat-card";
import { EmptyState } from "@/components/business/empty-state";
import { ReviewReplyForm } from "@/components/business/review-reply-form";
import { cn } from "@/lib/utils";

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn("size-3.5", i < rating ? "fill-app-accent text-app-accent" : "fill-muted text-muted")}
        />
      ))}
    </div>
  );
}

export default async function YorumlarPage() {
  const { businessId } = await requireBusiness();

  const reviews = await prisma.review.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
    include: { customer: { select: { name: true, avatarUrl: true } } },
  });

  const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Yorumlar" />

      {reviews.length > 0 && (
        <StatRow
          stats={[
            { icon: Star, label: "Ortalama Puan", value: avgRating.toFixed(1) },
            { icon: Star, label: "Toplam Yorum", value: reviews.length },
          ]}
        />
      )}

      {reviews.length === 0 ? (
        <EmptyState
          icon={Star}
          title="Henüz yorum yok"
          description="Tamamlanan randevulardan sonra müşteri yorumları burada görünecek."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <Avatar className="size-9 shrink-0">
                    {r.customer.avatarUrl ? <AvatarImage src={r.customer.avatarUrl} alt={r.customer.name} /> : null}
                    <AvatarFallback className="bg-app-accent-soft text-app-accent-soft-foreground">
                      {r.customer.name.slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{r.customer.name}</p>
                        <p className="text-xs text-muted-foreground">{formatRelativeTime(r.createdAt)}</p>
                      </div>
                      <RatingStars rating={r.rating} />
                    </div>
                    {r.comment ? (
                      <p className="mt-2 rounded-xl bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
                        {r.comment}
                      </p>
                    ) : null}
                  </div>
                </div>

                {r.ownerReply ? (
                  <div className="ml-12 rounded-xl bg-app-accent-soft p-3">
                    <p className="text-xs font-medium text-app-accent-soft-foreground">İşletme Yanıtı</p>
                    <p className="mt-1 text-sm text-app-accent-soft-foreground">{r.ownerReply}</p>
                  </div>
                ) : (
                  <div className="ml-12">
                    <ReviewReplyForm reviewId={r.id} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
