import { requireBusiness } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { BusinessShell } from "@/components/business/business-shell";

export default async function BusinessLayout({ children }: LayoutProps<"/business">) {
  const { businessId } = await requireBusiness();

  const business = await prisma.business.findUniqueOrThrow({
    where: { id: businessId },
    select: {
      name: true,
      logoUrl: true,
      subscription: { select: { status: true, currentPeriodEnd: true } },
    },
  });

  return (
    <BusinessShell businessName={business.name} logoUrl={business.logoUrl} subscription={business.subscription}>
      {children}
    </BusinessShell>
  );
}
