import Link from "next/link";
import { differenceInCalendarDays } from "date-fns";

export type SubscriptionSummary = {
  status: "ACTIVE" | "TRIAL" | "PAST_DUE" | "CANCELLED" | "EXPIRED";
  currentPeriodEnd: Date | null;
} | null;

export function TrialCard({ subscription }: { subscription: SubscriptionSummary }) {
  const daysLeft =
    subscription?.status === "TRIAL" && subscription.currentPeriodEnd
      ? differenceInCalendarDays(subscription.currentPeriodEnd, new Date())
      : null;

  if (subscription?.status === "ACTIVE") {
    return (
      <div className="mb-2 rounded-xl border border-border bg-card px-3.5 py-3">
        <p className="text-sm font-semibold">Looea Pro aktif</p>
        <p className="mt-0.5 text-xs text-muted-foreground">Üyeliğin sorunsuz devam ediyor.</p>
      </div>
    );
  }

  const trialActive = daysLeft !== null && daysLeft > 0;

  return (
    <div className="mb-2 rounded-xl bg-neutral-900 px-3.5 py-3.5 text-white dark:bg-black">
      <p className="text-sm font-semibold">
        {trialActive ? `Deneme süresi — ${daysLeft} gün kaldı` : "Deneme süresi sona erdi"}
      </p>
      <p className="mt-0.5 text-xs text-white/60">
        {trialActive
          ? "Kesintisiz devam etmek için planını seç."
          : "Looea'yı kullanmaya devam etmek için bir plan seç."}
      </p>
      <Link
        href="/business/uyelik"
        className="mt-3 flex items-center justify-center rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-white/90"
      >
        Planımı Seç
      </Link>
    </div>
  );
}
