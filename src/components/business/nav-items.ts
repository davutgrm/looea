import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  CalendarCheck,
  CalendarDays,
  Users,
  Scissors,
  UserCog,
  Images,
  Star,
  BarChart3,
  CreditCard,
  Settings,
} from "lucide-react";

export const BUSINESS_NAV_ITEMS = [
  { href: "/business", label: "Genel Bakış", icon: LayoutDashboard },
  { href: "/business/randevular", label: "Randevular", icon: CalendarCheck },
  { href: "/business/takvim", label: "Takvim", icon: CalendarDays },
  { href: "/business/musteriler", label: "Müşteriler", icon: Users },
  { href: "/business/hizmetler", label: "Hizmetler", icon: Scissors },
  { href: "/business/calisanlar", label: "Çalışanlar", icon: UserCog },
  { href: "/business/portfoy", label: "Portföy", icon: Images },
  { href: "/business/yorumlar", label: "Yorumlar", icon: Star },
  { href: "/business/istatistikler", label: "İstatistikler", icon: BarChart3 },
  { href: "/business/uyelik", label: "Üyelik", icon: CreditCard },
  { href: "/business/ayarlar", label: "Ayarlar", icon: Settings },
] as const;

export type BusinessNavItem = {
  href: (typeof BUSINESS_NAV_ITEMS)[number]["href"];
  label: string;
  icon: LucideIcon;
};
