"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, CalendarCheck, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/kesfet", label: "Ana Sayfa", icon: Home },
  { href: "/ara", label: "Ara", icon: Search },
  { href: "/hesabim/randevularim", label: "Randevularım", icon: CalendarCheck },
  { href: "/hesabim/favoriler", label: "Favoriler", icon: Heart },
  { href: "/hesabim", label: "Profil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur md:hidden">
      <div className="grid grid-cols-5">
        {ITEMS.map((item) => {
          const active =
            pathname === item.href || (item.href !== "/kesfet" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                active ? "text-app-accent" : "text-muted-foreground",
              )}
            >
              <Icon className={cn("size-5", active && "fill-app-accent/15")} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
