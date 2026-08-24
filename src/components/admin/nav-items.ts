import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Building2,
  Tags,
  CalendarDays,
  MessageSquare,
  CreditCard,
  Wallet,
  Settings,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/kullanicilar", label: "Kullanıcılar", icon: Users },
  { href: "/admin/isletmeler", label: "İşletmeler", icon: Building2 },
  { href: "/admin/kategoriler", label: "Kategoriler", icon: Tags },
  { href: "/admin/randevular", label: "Randevular", icon: CalendarDays },
  { href: "/admin/yorumlar", label: "Yorumlar", icon: MessageSquare },
  { href: "/admin/uyelikler", label: "Üyelikler", icon: CreditCard },
  { href: "/admin/odemeler", label: "Ödemeler", icon: Wallet },
  { href: "/admin/ayarlar", label: "Ayarlar", icon: Settings },
];
