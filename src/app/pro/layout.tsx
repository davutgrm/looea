import type { Metadata } from "next";
import { marketingFontVariables } from "@/lib/fonts";
import { ProHeader } from "@/components/pro/pro-header";
import { ProFooter } from "@/components/pro/pro-footer";

export const metadata: Metadata = {
  title: "Kuafi Pro — İşini büyüt, takvimini doldur.",
  description:
    "Kuaför, berber ve güzellik salonun için online randevu sistemi. Takvim ve personel yönetimi, doğrulanmış yorumlar, yeni müşteriler. İlk ay ücretsiz.",
};

export default function ProLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${marketingFontVariables} flex min-h-dvh flex-col font-sans`}>
      <ProHeader />
      <main className="flex-1">{children}</main>
      <ProFooter />
    </div>
  );
}
