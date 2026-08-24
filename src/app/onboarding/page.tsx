import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { getActiveCategories } from "@/lib/data/categories";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export default async function OnboardingPage() {
  const user = await requireUser();
  if (user.role !== "CUSTOMER") redirect("/");

  const [dbUser, categories] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: { onboardingCompleted: true },
    }),
    getActiveCategories(),
  ]);
  if (!dbUser || dbUser.onboardingCompleted) redirect("/kesfet");

  return (
    <OnboardingWizard
      categories={categories.map((c) => ({ id: c.id, name: c.name, serves: c.serves }))}
    />
  );
}
