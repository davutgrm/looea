"use client";

import { signOut } from "next-auth/react";
import { Heart, CalendarCheck, User as UserIcon, LogOut, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { CitySelector } from "./city-selector";
import { LocationPicker } from "./location-picker";

export function TopBar({ user }: { user: { name?: string | null; image?: string | null } | null }) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur md:border-none md:bg-transparent md:backdrop-blur-none">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <CitySelector className="flex-1 md:flex-none" />

        <form action="/ara" method="GET" className="relative hidden md:block md:w-64">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            placeholder="Hizmet veya kuaför ara..."
            className="w-full rounded-full border bg-card py-2 pl-10 pr-3 text-sm outline-none focus:border-app-accent"
          />
        </form>

        <div className="hidden flex-1 md:block" />

        <div className="hidden sm:block">
          <LocationPicker />
        </div>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-1 rounded-full ring-offset-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                <Avatar className="size-9">
                  <AvatarImage src={user.image ?? undefined} />
                  <AvatarFallback className="bg-app-accent-soft text-app-accent-soft-foreground">
                    {user.name?.[0]?.toUpperCase() ?? "S"}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/hesabim">
                  <UserIcon className="size-4" /> Profilim
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/hesabim/randevularim">
                  <CalendarCheck className="size-4" /> Randevularım
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/hesabim/favoriler">
                  <Heart className="size-4" /> Favorilerim
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })} variant="destructive">
                <LogOut className="size-4" /> Çıkış Yap
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/giris">Giriş Yap</Link>
            </Button>
            <Button variant="accent" size="sm" asChild>
              <Link href="/kayit">Kayıt Ol</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
