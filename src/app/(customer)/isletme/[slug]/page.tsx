import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Star,
  MapPin,
  BadgeCheck,
  Phone,
  AtSign,
  Globe,
  Navigation,
  Clock,
  ImageOff,
} from "lucide-react";
import { auth } from "@/auth";
import { getBusinessBySlug } from "@/lib/data/business";
import { prisma } from "@/lib/prisma";
import { DAY_LABELS, isOpenNow, sortedWeek } from "@/lib/business-hours";
import { getDirectionsUrl } from "@/lib/maps/directions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BusinessStickyBar } from "@/components/customer/business-sticky-bar";
import { ReviewCard } from "@/components/customer/review-card";
import { Price } from "@/components/customer/price";
import { MapView } from "@/components/map/map-view";

export default async function BusinessProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [session, business] = await Promise.all([auth(), getBusinessBySlug(slug)]);
  if (!business || !business.active) notFound();

  const isFavorite = session?.user
    ? !!(await prisma.favorite.findUnique({
        where: { customerId_businessId: { customerId: session.user.id, businessId: business.id } },
      }))
    : false;

  const open = isOpenNow(business.hours);
  const week = sortedWeek(business.hours);
  const today = new Date().getDay();
  const categoryTags = Array.from(new Set(business.services.map((s) => s.category.name))).slice(0, 3);
  const planName = business.subscription?.plan?.name;
  const showPlanBadge = business.subscription?.status === "ACTIVE" && planName;
  const previewReviews = business.reviews.slice(0, 2);

  return (
    <div className="pb-24">
      <BusinessStickyBar
        businessId={business.id}
        businessSlug={business.slug}
        businessName={business.name}
        isFavorite={isFavorite}
        isLoggedIn={!!session?.user}
      />

      <div className="mx-auto max-w-5xl px-4 pt-4">
        {/* Cover: darkened blurred backdrop + centered circular logo, unclipped */}
        <div className="relative">
          <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-app-accent-soft sm:h-52">
            {business.logoUrl ? (
              <Image
                src={business.logoUrl}
                alt=""
                aria-hidden
                fill
                className="scale-110 object-cover opacity-35 blur-md"
              />
            ) : business.coverImageUrl ? (
              <Image
                src={business.coverImageUrl}
                alt=""
                aria-hidden
                fill
                className="scale-110 object-cover opacity-35 blur-md"
              />
            ) : null}
            <div className="absolute inset-0 bg-black/25" />
          </div>

          <div className="absolute inset-x-0 -bottom-12 flex justify-center">
            <div className="relative size-24 shrink-0 overflow-hidden rounded-full bg-card shadow-md ring-4 ring-background">
              {business.logoUrl ? (
                <Image src={business.logoUrl} alt={business.name} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-2xl font-bold text-muted-foreground">
                  {business.name[0]}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="pt-16">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">{business.name}</h1>
            {business.verified && (
              <Badge variant="accent-soft" className="gap-1">
                <BadgeCheck className="size-3.5" /> Onaylı
              </Badge>
            )}
            {showPlanBadge && <Badge variant="accent">{planName}</Badge>}
            {business.availableNow && <Badge variant="secondary">🟢 Şu an müsait</Badge>}
          </div>

          {categoryTags.length > 0 && (
            <p className="mt-1.5 text-sm text-muted-foreground">{categoryTags.join(" · ")}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <span className="flex items-center gap-1 font-medium">
              <Star className="size-4 fill-app-accent text-app-accent" />
              {business.ratingAvg > 0 ? business.ratingAvg.toFixed(1) : "Yeni"}
              <span className="text-muted-foreground">({business.ratingCount} değerlendirme)</span>
            </span>
            {business.location && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="size-4" /> {business.location.city}
              </span>
            )}
            <span
              className={`flex items-center gap-1 font-medium ${open ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}
            >
              <span className={`size-1.5 rounded-full ${open ? "bg-emerald-500" : "bg-muted-foreground"}`} />
              {open ? "Açık" : "Kapalı"}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {business.location && (
              <Button variant="outline" asChild>
                <a
                  href={getDirectionsUrl({ lat: business.location.latitude, lng: business.location.longitude })}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Navigation className="size-4" /> Yol Tarifi
                </a>
              </Button>
            )}
            <Button variant="accent" asChild>
              <Link href={`/isletme/${business.slug}/randevu-al`}>Randevu Al</Link>
            </Button>
          </div>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-3">
          <div className="space-y-9 md:col-span-2">
            {/* About */}
            {business.description && (
              <section>
                <h2 className="text-xl font-bold">Hakkında</h2>
                <p className="mt-2 text-sm leading-relaxed text-foreground">{business.description}</p>
              </section>
            )}

            {/* Services */}
            <section>
              <h2 className="text-xl font-bold">Hizmet Seçimi</h2>
              <div className="mt-3 space-y-2">
                {business.services.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-4 shadow-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{service.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {service.category.name} · {service.durationMinutes} dk
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <p className="font-semibold"><Price amount={service.price} /></p>
                      <Button variant="accent" size="sm" asChild>
                        <Link href={`/isletme/${business.slug}/randevu-al?hizmet=${service.id}`}>Seç</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Where */}
            {business.location && (
              <section>
                <h2 className="text-xl font-bold">Nerede</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {business.location.address}, {business.location.city}
                </p>
                <div className="relative mt-3 overflow-hidden rounded-2xl border">
                  <MapView
                    center={{ lat: business.location.latitude, lng: business.location.longitude }}
                    zoom={15}
                    markers={[
                      {
                        id: business.id,
                        position: { lat: business.location.latitude, lng: business.location.longitude },
                        label: business.name,
                      },
                    ]}
                    className="h-56 w-full"
                  />
                  <Button variant="accent" size="sm" className="absolute bottom-3 right-3 z-[1000] shadow-lg" asChild>
                    <a
                      href={getDirectionsUrl({ lat: business.location.latitude, lng: business.location.longitude })}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Navigation className="size-4" /> Yol Tarifi
                    </a>
                  </Button>
                </div>
              </section>
            )}

            {/* Gallery */}
            <section>
              <h2 className="text-xl font-bold">Galeri</h2>
              {business.portfolioImages.length > 0 ? (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {business.portfolioImages.map((img) => (
                    <div key={img.id} className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                      <Image src={img.imageUrl} alt={img.category?.name ?? business.name} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-3 flex flex-col items-center gap-2 rounded-2xl border border-dashed py-10 text-center">
                  <ImageOff className="size-5 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Henüz galeri fotoğrafı eklenmemiş.</p>
                </div>
              )}
            </section>

            {/* Staff */}
            {business.staff.length > 0 && (
              <section>
                <h2 className="text-xl font-bold">Çalışanlar</h2>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {business.staff.map((s) => (
                    <div key={s.id} className="rounded-2xl border bg-card p-4 text-center shadow-sm">
                      <div className="relative mx-auto size-16 overflow-hidden rounded-full bg-muted">
                        {s.avatarUrl && <Image src={s.avatarUrl} alt={s.name} fill className="object-cover" />}
                      </div>
                      <p className="mt-2 text-sm font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.title}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews */}
            <section id="degerlendirmeler">
              <h2 className="text-xl font-bold">Değerlendirmeler ({business.reviews.length})</h2>
              <div className="mt-3 space-y-3">
                {business.reviews.length === 0 && (
                  <p className="text-sm text-muted-foreground">Henüz yorum yok.</p>
                )}
                {business.reviews.map((review) => (
                  <div key={review.id} className="rounded-2xl border bg-card p-4 shadow-sm">
                    <div className="mb-2 flex justify-end">
                      <Badge variant="secondary" className="text-[10px]">
                        Doğrulanmış Randevu
                      </Badge>
                    </div>
                    <ReviewCard
                      name={review.customer.name}
                      avatarUrl={review.customer.avatarUrl}
                      rating={review.rating}
                      comment={review.comment}
                      createdAt={review.createdAt}
                    />
                    {review.ownerReply && (
                      <div className="mt-2 rounded-xl bg-secondary/50 p-3 text-xs">
                        <span className="font-medium">İşletme yanıtı: </span>
                        {review.ownerReply}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sticky sidebar: rating summary + hours */}
          <aside className="space-y-4 md:sticky md:top-20 md:self-start">
            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-foreground">Genel Puan</h3>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-bold">
                  {business.ratingAvg > 0 ? business.ratingAvg.toFixed(1) : "—"}
                </span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-3.5 ${i < Math.round(business.ratingAvg) ? "fill-app-accent text-app-accent" : "text-muted"}`}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{business.ratingCount} değerlendirme</p>

              {previewReviews.length > 0 && (
                <div className="mt-4 space-y-4 border-t pt-4">
                  {previewReviews.map((r) => (
                    <ReviewCard
                      key={r.id}
                      name={r.customer.name}
                      avatarUrl={r.customer.avatarUrl}
                      rating={r.rating}
                      comment={r.comment}
                      createdAt={r.createdAt}
                    />
                  ))}
                </div>
              )}

              {business.reviews.length > 0 && (
                <a href="#degerlendirmeler" className="mt-4 block text-center text-sm font-medium text-app-accent hover:underline">
                  Tümünü gör
                </a>
              )}
            </div>

            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Clock className="size-4" /> Çalışma Saatleri
              </h3>
              <div className="mt-3 space-y-1.5 text-sm">
                {week.map((h) => {
                  const dayClosed = h.isClosed || !h.openTime;
                  return (
                    <div key={h.dayOfWeek} className={`flex items-center justify-between ${h.dayOfWeek === today ? "font-semibold" : ""}`}>
                      <span className={`flex items-center gap-2 ${h.dayOfWeek === today ? "" : "text-muted-foreground"}`}>
                        <span className={`size-1.5 shrink-0 rounded-full ${dayClosed ? "bg-destructive" : "bg-emerald-500"}`} />
                        {DAY_LABELS[h.dayOfWeek]}
                      </span>
                      {dayClosed ? (
                        <span className="text-destructive">Kapalı</span>
                      ) : (
                        <span>{h.openTime} - {h.closeTime}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-foreground">İletişim</h3>
              <div className="mt-3 space-y-2 text-sm">
                {business.phone && (
                  <p className="flex items-center gap-2 text-foreground">
                    <Phone className="size-4 shrink-0" /> {business.phone}
                  </p>
                )}
                {business.instagram && (
                  <a href={business.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-app-accent hover:underline">
                    <AtSign className="size-4 shrink-0" /> Instagram
                  </a>
                )}
                {business.website && (
                  <a href={business.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-app-accent hover:underline">
                    <Globe className="size-4 shrink-0" /> Website
                  </a>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
