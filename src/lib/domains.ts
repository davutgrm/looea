/**
 * Looea çift-dünya (müşteri / pro) subdomain yardımcıları.
 *
 * TEK kod tabanı, TEK deploy. Müşteri dünyası ana domain'de (`kuafi.com`),
 * işletme dünyası `pro.` subdomain'inde (`pro.kuafi.com`) yaşar. Ayrım host
 * bazında `proxy.ts` içinde yapılır; burada da o ayrımın paylaşılan mantığı durur.
 *
 * Geliştirmede iki yol var:
 *   1. `http://pro.localhost:3001` — tarayıcılar `*.localhost`'u otomatik olarak
 *      127.0.0.1'e çözer, proxy `pro.localhost`'u pro host olarak algılar.
 *   2. `http://localhost:3001/pro` — subdomain kurmadan doğrudan pro landing.
 *
 * Prod'da `NEXT_PUBLIC_APP_URL` ve `NEXT_PUBLIC_PRO_URL` env'leri set edilir
 * (ör. `https://kuafi.com` / `https://pro.kuafi.com`).
 */

/** Bir host'un pro (işletme) subdomain'i olup olmadığını söyler. */
export function isProHost(host?: string | null): boolean {
  if (!host) return false;
  const hostname = host.split(":")[0].toLowerCase();

  const configured = process.env.NEXT_PUBLIC_PRO_HOST?.toLowerCase();
  if (configured && hostname === configured) return true;

  // `pro.localhost` (dev) ve `pro.<domain>` (prod) — ikisini de kapsar.
  return hostname === "pro.localhost" || hostname.startsWith("pro.");
}

/**
 * Müşteri (ana) site kök URL'i. Env yoksa boş string döner = aynı origin
 * (dev'de relatif linkler kullanılır).
 */
export function customerBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
}

/**
 * Pro (işletme) site kök URL'i. Env yoksa boş string döner = dev'de pro landing
 * `/pro` path'inde aynı origin üzerinden servis edilir.
 */
export function proBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_PRO_URL ?? "").replace(/\/$/, "");
}

/**
 * Müşteri tarafından pro tarafına giden link. Prod'da mutlak (`https://pro...`),
 * dev'de relatif (`/pro...`) çözülür.
 */
export function proHref(path = "/"): string {
  const base = proBaseUrl();
  if (base) return `${base}${path}`;
  // Dev / env yok: SADECE pro landing'i `/pro`'da yaşar; diğer rotalar (/giris,
  // /isletme-kaydet, /business …) tüm host'larda üst seviyede paylaşılır, o yüzden
  // aynı origin'de relatif path'e düşerler.
  return path === "/" ? "/pro" : path;
}

/**
 * Pro tarafından müşteri tarafına giden link. Prod'da mutlak, dev'de relatif.
 */
export function customerHref(path = "/"): string {
  const base = customerBaseUrl();
  if (base) return `${base}${path}`;
  return path;
}
