import { headers } from "next/headers";
import { isProHost } from "@/lib/domains";

/**
 * Sunucu bileşenlerinde geçerli isteğin pro (işletme) host'undan gelip gelmediğini
 * söyler. `headers()` okunduğu için bunu kullanan sayfa dinamik hale gelir.
 */
export async function isProRequest(): Promise<boolean> {
  const host = (await headers()).get("host");
  return isProHost(host);
}
