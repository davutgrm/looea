import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export default async function OnboardingPage() {
  const user = await requireUser();
  if (user.role !== "CUSTOMER") redirect("/");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { onboardingCompleted: true },
  });
  if (!dbUser || dbUser.onboardingCompleted) redirect("/kesfet");

  return <OnboardingWizard />;
}
