import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "Looea — Doğru kuaförü bul. Randevunu al.",
  description:
    "Yakınındaki kuaförleri, berberleri ve güzellik salonlarını keşfet, çalışmalarını gör, fiyatları karşılaştır ve saniyeler içinde randevunu oluştur.",
  appleWebApp: {
    capable: true,
    title: "Looea",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#A21CDB",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* JS olmadan/hydration tamamlanmadan [data-reveal] içeriğinin kalıcı
            gizli kalmaması için: bu sınıf yalnızca gerçek bir tarayıcı JS'i
            çalıştırınca eklenir, globals.css'teki reveal opacity kuralı buna bağlı. */}
        <Script id="js-enabled" strategy="beforeInteractive">
          {`document.documentElement.classList.add('js')`}
        </Script>
        <Providers>
          {children}
          <Toaster position="top-center" richColors />
        </Providers>
      </body>
    </html>
  );
}
