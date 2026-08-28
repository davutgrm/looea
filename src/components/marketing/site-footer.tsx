import Link from "next/link";
import { proHref } from "@/lib/domains";

const CITY_LINKS = [
  { label: "Kuaför İstanbul", href: "/kuafor/istanbul" },
  { label: "Berber Ankara", href: "/kuafor/ankara" },
  { label: "Güzellik Salonu İzmir", href: "/kuafor/izmir" },
  { label: "Berber Bursa", href: "/kuafor/bursa" },
  { label: "Kuaför Antalya", href: "/kuafor/antalya" },
  { label: "Berber Adana", href: "/kuafor/adana" },
  { label: "Güzellik Salonu Konya", href: "/kuafor/konya" },
  { label: "Kuaför Gaziantep", href: "/kuafor/gaziantep" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-black/5 bg-black text-white dark:border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="font-grotesk flex items-center gap-1.5 text-xl font-bold">
              Kuafi
              <span className="size-1.5 rounded-full bg-violet-500" />
            </div>
            <p className="mt-3 max-w-xs text-sm text-white/50">
              Yakınındaki <span className="font-instrument text-[0.88em] text-violet-400 italic">en iyi kuaförü</span> bul, çalışmalarını gör, randevunu saniyeler içinde al.
            </p>
          </div>
          <div className="space-y-3 text-sm">
            <p className="font-semibold text-white/90">Müşteriler</p>
            <Link href="/kesfet" className="block text-white/50 hover:text-white">Kuaför Bul</Link>
            <Link href="/ara" className="block text-white/50 hover:text-white">Yakınımdakiler</Link>
            <Link href="/kayit" className="block text-white/50 hover:text-white">Üye Ol</Link>
          </div>
          <div className="space-y-3 text-sm">
            <p className="font-semibold text-white/90">İşletmeler</p>
            <a href={proHref("/")} className="block text-white/50 hover:text-white">Kuafi Pro</a>
            <Link href="/isletme-kaydet" className="block text-white/50 hover:text-white">İşletmeni Kaydet</Link>
            <Link href="/giris" className="block text-white/50 hover:text-white">İşletme Girişi</Link>
            <Link href="/#karsilastirma" className="block text-white/50 hover:text-white">Neden Kuafi?</Link>
          </div>
          <div className="space-y-3 text-sm">
            <p className="font-semibold text-white/90">Kuafi</p>
            <Link href="/#nasil-calisir" className="block text-white/50 hover:text-white">Nasıl Çalışır?</Link>
            <Link href="/#sss" className="block text-white/50 hover:text-white">Sıkça Sorulan Sorular</Link>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8">
          <p className="text-xs font-semibold tracking-[0.2em] text-white/40 uppercase">Şehirler</p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            {CITY_LINKS.map((c) => (
              <Link key={c.href} href={c.href} className="text-sm text-white/50 hover:text-white">
                {c.label}
              </Link>
            ))}
          </div>
        </div>

        <p className="mt-10 text-xs text-white/30">
          © {new Date().getFullYear()} Kuafi. Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  );
}
