import Link from "next/link";
import { customerHref } from "@/lib/domains";

export function ProFooter() {
  return (
    <footer className="border-t border-black/5 bg-black text-white dark:border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="font-grotesk flex items-center gap-1.5 text-xl font-bold">
              Kuafi
              <span className="rounded-md bg-violet-500 px-1.5 py-0.5 text-[11px] font-bold text-white">Pro</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-white/50">
              İşletmen için <span className="font-instrument text-[0.88em] text-violet-400 italic">online randevu</span> sistemi — takvimini doldur, müşterini büyüt.
            </p>
          </div>
          <div className="space-y-3 text-sm">
            <p className="font-semibold text-white/90">İşletmeler</p>
            <Link href="/isletme-kaydet" className="block text-white/50 hover:text-white">Ücretsiz Başla</Link>
            <Link href="/giris" className="block text-white/50 hover:text-white">İşletme Girişi</Link>
            <Link href="/#fiyat" className="block text-white/50 hover:text-white">Fiyatlandırma</Link>
            <Link href="/#sss" className="block text-white/50 hover:text-white">Sıkça Sorulan Sorular</Link>
          </div>
          <div className="space-y-3 text-sm">
            <p className="font-semibold text-white/90">Kuafi</p>
            <a href={customerHref("/")} className="block text-white/50 hover:text-white">Müşteri Tarafı</a>
            <a href={customerHref("/kesfet")} className="block text-white/50 hover:text-white">Kuaför Bul</a>
            <a href="mailto:destek@kuafi.app" className="block text-white/50 hover:text-white">Destek</a>
          </div>
        </div>

        <p className="mt-12 border-t border-white/10 pt-8 text-xs text-white/30">
          © {new Date().getFullYear()} Kuafi. Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  );
}
