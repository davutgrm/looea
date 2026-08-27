import Link from "next/link";

export function SiteHeader() {
  return (
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
  );
}
