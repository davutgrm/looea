"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, Scissors } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ADMIN_NAV_ITEMS } from "@/components/admin/nav-items";

export function AdminSidebar({ name, email }: { name: string; email: string }) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/10 bg-neutral-950 text-neutral-200 md:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Scissors className="size-4" />
        </div>
        <div className="min-w-0 leading-tight">
          <p className="font-heading text-sm font-semibold text-white">Looea</p>
          <p className="truncate text-[11px] text-neutral-400">Yönetim Paneli</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {ADMIN_NAV_ITEMS.map((item) => {
          const active =
            item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-white/10 text-white"
                  : "text-neutral-400 hover:bg-white/5 hover:text-neutral-100"
              )}
            >
              <Icon className={cn("size-4", active && "text-primary")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
          <Avatar className="size-8">
            <AvatarFallback className="bg-white/10 text-xs text-white">
              {name.slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{name}</p>
            <p className="truncate text-xs text-neutral-400">{email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="mt-1 w-full justify-start gap-2 text-neutral-300 hover:bg-white/5 hover:text-white"
          onClick={() => signOut({ callbackUrl: "/giris" })}
        >
          <LogOut className="size-4" />
          Çıkış Yap
        </Button>
      </div>
    </aside>
  );
}
