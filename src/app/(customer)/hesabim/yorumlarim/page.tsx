import Link from "next/link";
import Image from "next/image";
import { MessageSquareText, Star } from "lucide-react";
import { requireUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { getBusinessPath } from "@/lib/business-url";
import { Button } from "@/components/ui/button";
import { ReviewDialog } from "@/components/customer/review-dialog";
import { EmptyState } from "@/components/customer/empty-state";

export default async function MyReviewsPage() {
  const user = await requireUser();

  const businessSelect = {
    name: true,
    slug: true,
    logoUrl: true,
    location: { select: { city: true, district: true } },
  } as const;

  const [pendingAppointments, reviews] = await Promise.all([
    prisma.appointment.findMany({
      where: { customerId: user.id, status: "COMPLETED", review: null },
      include: { business: { select: businessSelect }, service: { select: { name: true } } },
      orderBy: { date: "desc" },
    }),
    prisma.review.findMany({
      where: { customerId: user.id },
      include: { business: { select: businessSelect } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const isEmpty = pendingAppointments.length === 0 && reviews.length === 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-bold">Yorumlarım</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Yazdığın değerlendirmeler ve değerlendirmeni bekleyen randevular.
      </p>

      {isEmpty ? (
        <EmptyState
          className="mt-6"
          icon={MessageSquareText}
          title="Henüz yorum yazmadın"
          description="Randevun tamamlandıktan sonra deneyimini paylaşabilirsin."
          action={
            <Button variant="accent" size="sm" asChild>
              <Link href="/ara">Kuaför Bul</Link>
            </Button>
          }
        />
      ) : (
        <div className="mt-6 space-y-8">
          {pendingAppointments.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground">
                Değerlendirmeni bekleyen randevular
              </h2>
              <div className="space-y-3">
                {pendingAppointments.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-sm">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-muted">
                      {a.business.logoUrl ? (
                        <Image src={a.business.logoUrl} alt={a.business.name} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm font-bold text-muted-foreground">
                          {a.business.name[0]}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{a.business.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {a.service.name} · {a.date.toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}
                      </p>
                    </div>
                    <ReviewDialog appointmentId={a.id} businessName={a.business.name} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {reviews.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground">Yazdığın değerlendirmeler</h2>
              <div className="space-y-3">
                {reviews.map((r) => (
                  <Link
                    key={r.id}
                    href={getBusinessPath({
                      slug: r.business.slug,
                      city: r.business.location?.city,
                      district: r.business.location?.district,
                    })}
                    className="block rounded-2xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-muted">
                        {r.business.logoUrl ? (
                          <Image src={r.business.logoUrl} alt={r.business.name} fill className="object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs font-bold text-muted-foreground">
                            {r.business.name[0]}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{r.business.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.createdAt.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`size-3.5 ${i < r.rating ? "fill-app-accent text-app-accent" : "text-muted"}`}
                          />
                        ))}
                      </div>
                    </div>
                    {r.comment && (
                      <p className="mt-3 rounded-xl bg-muted/60 px-3 py-2 text-sm text-foreground">{r.comment}</p>
                    )}
                    {r.photoUrl && (
                      <div className="relative mt-3 aspect-video w-full overflow-hidden rounded-xl bg-muted">
                        <Image src={r.photoUrl} alt="" fill className="object-cover" />
                      </div>
                    )}
                    {r.ownerReply && (
                      <div className="mt-2 rounded-xl bg-secondary/50 p-3 text-xs">
                        <span className="font-medium">İşletme yanıtı: </span>
                        {r.ownerReply}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
