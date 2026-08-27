import Link from "next/link";
import { Bell, CalendarCheck, Heart, HelpCircle, MessageSquareText, Settings, CreditCard } from "lucide-react";
import { requireUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileForm } from "@/components/customer/profile-form";
import { SegmentToggle } from "@/components/customer/segment-toggle";

const MENU = [
  { href: "/hesabim/randevularim", label: "Randevularım", icon: CalendarCheck },
  { href: "/hesabim/favoriler", label: "Favorilerim", icon: Heart },
  { href: "/hesabim/yorumlarim", label: "Yorumlarım", icon: MessageSquareText },
  { href: "/hesabim/bildirimler", label: "Bildirimler", icon: Bell },
  { href: "#odeme", label: "Ödeme Yöntemleri", icon: CreditCard },
  { href: "#ayarlar", label: "Ayarlar", icon: Settings },
  { href: "#yardim", label: "Yardım", icon: HelpCircle },
];

export default async function ProfilePage() {
  const user = await requireUser();
  const me = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-6">
      <div className="flex items-center gap-4">
        <Avatar className="size-16">
          <AvatarImage src={me.avatarUrl ?? undefined} />
          <AvatarFallback className="bg-app-accent-soft text-lg text-app-accent-soft-foreground">{me.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl font-bold">{me.name}</h1>
          <p className="text-sm text-muted-foreground">{me.email}</p>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Kişisel Bilgiler</h2>
        <ProfileForm name={me.name} phone={me.phone ?? ""} />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Aradığın hizmetler</h2>
        <SegmentToggle value={me.segment} />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Menü</h2>
        <div className="divide-y rounded-2xl border">
          {MENU.map((item) => (
            <Link key={item.label} href={item.href} className="flex items-center gap-3 p-4 text-sm hover:bg-accent">
              <item.icon className="size-4 text-app-accent" />
              {item.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
