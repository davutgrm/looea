import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth-guard";
import { spaceGrotesk } from "@/lib/fonts";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminMobileNav } from "@/components/admin/mobile-nav";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireRole("ADMIN");
  const name = user.name ?? "Admin";
  const email = user.email ?? "";

  return (
    <div className={`${spaceGrotesk.variable} font-grotesk [--font-heading:var(--font-grotesk)] min-h-screen bg-muted/30`}>
      <AdminSidebar name={name} email={email} />
      <AdminMobileNav name={name} email={email} />
      <main className="md:pl-64">
        <div className="mx-auto max-w-[1400px] px-4 py-6 md:px-8 md:py-8">{children}</div>
      </main>
    </div>
  );
}
