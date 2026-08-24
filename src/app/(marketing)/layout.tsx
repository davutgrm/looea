import Link from "next/link";
import { marketingFontVariables } from "@/lib/fonts";

const CITY_LINKS = [
  { label: "Kuaför İstanbul", href: "/ara?q=istanbul" },
  { label: "Berber Ankara", href: "/ara?q=ankara" },
  { label: "Güzellik Salonu İzmir", href: "/ara?q=izmir" },
  { label: "Berber Bursa", href: "/ara?q=bursa" },
  { label: "Kuaför Antalya", href: "/ara?q=antalya" },
  { label: "Berber Adana", href: "/ara?q=adana" },
  { label: "Güzellik Salonu Konya", href: "/ara?q=konya" },
  { label: "Kuaför Gaziantep", href: "/ara?q=gaziantep" },
];

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${marketingFontVariables} flex min-h-dvh flex-col font-sans`}>
      <header className="sticky top-4 z-30 px-4">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-6 rounded-full border border-black/5 bg-white/90 px-5 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_16px_32px_-16px_rgba(0,0,0,0.15)] backdrop-blur-md dark:border-white/10 dark:bg-neutral-900/90">
          <Link href="/" className="font-grotesk flex items-center gap-1.5 text-xl font-bold tracking-tight">
            Kuafi
            <span className="size-1.5 rounded-full bg-violet-600" />
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-black/60 md:flex dark:text-white/60">
            <Link href="/#hizmetler" className="hover:text-foreground">Hizmetler</Link>
            <Link href="/#nasil-calisir" className="hover:text-foreground">Nasıl Çalışır</Link>
            <Link href="/#kuaforler-icin" className="hover:text-foreground">Kuaförler İçin</Link>
            <Link href="/#uyelik" className="hover:text-foreground">Üyelik</Link>
            <Link href="/#sss" className="hover:text-foreground">SSS</Link>
          </nav>

          <div className="flex-1" />

          <Link href="/giris" className="hidden text-sm font-medium text-black/60 hover:text-foreground sm:block dark:text-white/60">
            Giriş Yap
          </Link>
          <Link
            href="/isletme-kaydet"
            className="hidden text-sm font-medium text-black/60 hover:text-foreground sm:block dark:text-white/60"
          >
            İşletmeler için →
          </Link>
          <Link
            href="/kesfet"
            className="rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
          >
            Kuaför Bul
          </Link>
        </div>
      </header>

      <main className="flex-1">{children}</main>

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
              <Link href="/isletme-kaydet" className="block text-white/50 hover:text-white">İşletmeni Kaydet</Link>
              <Link href="/giris" className="block text-white/50 hover:text-white">İşletme Girişi</Link>
              <Link href="/#uyelik" className="block text-white/50 hover:text-white">Üyelik</Link>
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
    </div>
  );
}
