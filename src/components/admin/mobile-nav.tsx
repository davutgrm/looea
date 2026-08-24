"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, Menu, Scissors } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ADMIN_NAV_ITEMS } from "@/components/admin/nav-items";

export function AdminMobileNav({ name, email }: { name: string; email: string }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-4 md:hidden">
      <Link href="/admin" className="flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Scissors className="size-3.5" />
        </div>
        <span className="font-heading text-sm font-semibold">Kuafi Admin</span>
      </Link>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 border-neutral-800 bg-neutral-950 p-0 text-neutral-200">
          <SheetHeader className="border-b border-white/10">
            <SheetTitle className="text-white">{name}</SheetTitle>
            <p className="truncate text-xs text-neutral-400">{email}</p>
          </SheetHeader>
          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            {ADMIN_NAV_ITEMS.map((item) => {
              const active =
                item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
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
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-neutral-300 hover:bg-white/5 hover:text-white"
              onClick={() => signOut({ callbackUrl: "/giris" })}
            >
              <LogOut className="size-4" />
              Çıkış Yap
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
