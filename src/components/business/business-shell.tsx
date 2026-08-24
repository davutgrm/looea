"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Menu, LogOut, Settings, ChevronsUpDown, Scissors as ScissorsLogo } from "lucide-react";
import { cn } from "@/lib/utils";
import { spaceGrotesk } from "@/lib/fonts";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BUSINESS_NAV_ITEMS } from "@/components/business/nav-items";
import { TrialCard, type SubscriptionSummary } from "@/components/business/trial-card";

function isActive(pathname: string, href: string): boolean {
  if (href === "/business") return pathname === "/business";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-2">
      {BUSINESS_NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-app-accent text-app-accent-foreground"
                : "text-muted-foreground hover:bg-app-accent-soft hover:text-app-accent-soft-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function BrandHeader() {
  return (
    <div className="flex items-center gap-2.5 px-4 py-4">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-app-accent text-app-accent-foreground">
        <ScissorsLogo className="size-4.5" />
      </div>
      <span className="font-grotesk text-[15px] font-bold tracking-tight">Kuafi</span>
    </div>
  );
}

function AccountMenu({
  businessName,
  logoUrl,
}: {
  businessName: string;
  logoUrl: string | null;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-muted">
          <Avatar className="size-8 shrink-0">
            {logoUrl ? <AvatarImage src={logoUrl} alt={businessName} /> : null}
            <AvatarFallback className="bg-app-accent-soft text-app-accent-soft-foreground">
              {businessName[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="min-w-0 flex-1 truncate text-sm font-medium">{businessName}</span>
          <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top" className="w-56">
        <DropdownMenuItem asChild>
          <Link href="/business/ayarlar">
            <Settings className="size-4" /> Ayarlar
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })} variant="destructive">
          <LogOut className="size-4" /> Çıkış Yap
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function BusinessShell({
  businessName,
  logoUrl,
  subscription,
  children,
}: {
  businessName: string;
  logoUrl: string | null;
  subscription: SubscriptionSummary;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div
      className={cn(
        spaceGrotesk.variable,
        "font-grotesk [--font-heading:var(--font-grotesk)] flex min-h-svh w-full bg-muted/30",
      )}
    >
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
        <BrandHeader />
        <NavList />
        <div className="border-t border-border p-3">
          <TrialCard subscription={subscription} />
          <AccountMenu businessName={businessName} logoUrl={logoUrl} />
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-background/95 px-3 py-2.5 backdrop-blur-sm md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="size-5" />
                <span className="sr-only">Menü</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex w-72 flex-col p-0">
              <SheetTitle className="sr-only">Kuafi menü</SheetTitle>
              <BrandHeader />
              <NavList onNavigate={() => setMobileOpen(false)} />
              <div className="border-t border-border p-3">
                <TrialCard subscription={subscription} />
                <AccountMenu businessName={businessName} logoUrl={logoUrl} />
              </div>
            </SheetContent>
          </Sheet>
          <span className="font-grotesk truncate text-sm font-semibold">{businessName}</span>
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={businessName}
              width={28}
              height={28}
              className="ml-auto size-7 shrink-0 rounded-full object-cover ring-1 ring-border"
              unoptimized
            />
          ) : null}
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
