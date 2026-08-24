"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Home, MapPin, CalendarCheck, Heart, Settings, LogOut, ChevronsUpDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/kesfet", label: "Ana Sayfa", icon: Home },
  { href: "/ara", label: "Keşfet & Harita", icon: MapPin },
  { href: "/hesabim/randevularim", label: "Randevular", icon: CalendarCheck },
  { href: "/hesabim/favoriler", label: "Favoriler", icon: Heart },
  { href: "/hesabim", label: "Ayarlar", icon: Settings },
];

export function AppSidebar({
  user,
}: {
  user: { name?: string | null; image?: string | null } | null;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/hesabim") return pathname === "/hesabim";
    if (href === "/kesfet") return pathname === "/kesfet" || pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r bg-sidebar px-3 py-5 md:flex">
      <Link href="/kesfet" className="px-3 text-2xl font-bold tracking-tight text-app-accent">
        Kuafi
      </Link>

      <nav className="mt-8 flex flex-col gap-2">
        {NAV.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-full px-4 py-3 text-base font-semibold transition-colors",
                active
                  ? "bg-app-accent text-app-accent-foreground"
                  : "text-foreground hover:bg-app-accent-soft hover:text-app-accent-soft-foreground",
              )}
            >
              <Icon className="size-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t pt-3">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-muted">
                <Avatar className="size-8">
                  <AvatarImage src={user.image ?? undefined} />
                  <AvatarFallback className="bg-app-accent-soft text-app-accent-soft-foreground">
                    {user.name?.[0]?.toUpperCase() ?? "S"}
                  </AvatarFallback>
                </Avatar>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{user.name ?? "Hesabım"}</span>
                <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="w-52">
              <DropdownMenuItem asChild>
                <Link href="/hesabim">
                  <Settings className="size-4" /> Hesabım
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })} variant="destructive">
                <LogOut className="size-4" /> Çıkış Yap
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex flex-col gap-2 px-1">
            <Button variant="accent" size="sm" asChild>
              <Link href="/giris">Giriş Yap</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/kayit">Kayıt Ol</Link>
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
