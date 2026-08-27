import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { spaceGrotesk } from "@/lib/fonts";
import { LocationProvider } from "@/components/customer/location-provider";
import { TopBar } from "@/components/customer/top-bar";
import { BottomNav } from "@/components/customer/bottom-nav";
import { AppSidebar } from "@/components/customer/app-sidebar";

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user ?? null;

  let unreadNotificationCount = 0;
  if (user?.role === "CUSTOMER") {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { onboardingCompleted: true },
    });
    if (dbUser && !dbUser.onboardingCompleted) redirect("/onboarding");
    unreadNotificationCount = await prisma.notification.count({ where: { userId: user.id, read: false } });
  }

  return (
    <LocationProvider>
      <div className={`${spaceGrotesk.variable} font-grotesk [--font-heading:var(--font-grotesk)]`}>
        <div className="flex min-h-dvh">
          <AppSidebar user={user} unreadNotificationCount={unreadNotificationCount} />
          <div className="flex min-w-0 flex-1 flex-col">
            <TopBar user={user} />
            <main className="flex-1 pb-16 md:pb-0">{children}</main>
          </div>
        </div>
        <BottomNav />
      </div>
    </LocationProvider>
  );
}
