import { spaceGrotesk } from "@/lib/fonts";
import { LocationProvider } from "@/components/customer/location-provider";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";

// Public, indexable discovery pages (business profiles, city/district/segment
// landing pages) — deliberately outside the (customer) dashboard shell so
// search-engine visitors land on a fast, chrome-free page instead of the
// logged-in app sidebar.
export default function DiscoveryLayout({ children }: { children: React.ReactNode }) {
  return (
    <LocationProvider>
      <div className={`${spaceGrotesk.variable} flex min-h-dvh flex-col font-grotesk [--font-heading:var(--font-grotesk)]`}>
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </LocationProvider>
  );
}
