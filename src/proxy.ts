import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { isProHost } from "@/lib/domains";

const { auth } = NextAuth(authConfig);

/** Giriş gerektiren bir yol için `/giris`'e (callbackUrl ile) yönlendirir. */
function redirectToLogin(req: Parameters<Parameters<typeof auth>[0]>[0]) {
  const url = req.nextUrl.clone();
  url.pathname = "/giris";
  url.search = "";
  url.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(url);
}

export default auth((req) => {
  const { nextUrl } = req;
  const path = nextUrl.pathname;
  const pro = isProHost(req.headers.get("host"));

  // --- Host bazlı ayrım: pro subdomain'in kökü işletme landing'ini gösterir ---
  // Müşteri landing'i pro. subdomain'inde ASLA görünmez; kök `/pro`'ya rewrite edilir.
  if (pro && path === "/") {
    const url = nextUrl.clone();
    url.pathname = "/pro";
    return NextResponse.rewrite(url);
  }

  // --- Rol bazlı koruma (eski authConfig.authorized mantığının aynısı) ---
  const isLoggedIn = !!req.auth?.user;
  const role = req.auth?.user?.role;

  if (path.startsWith("/admin")) {
    if (!(isLoggedIn && role === "ADMIN")) return redirectToLogin(req);
  } else if (path.startsWith("/business")) {
    if (!(isLoggedIn && role === "BUSINESS_OWNER")) return redirectToLogin(req);
  } else if (path.startsWith("/hesabim")) {
    if (!isLoggedIn) return redirectToLogin(req);
  }

  return NextResponse.next();
});

export const config = {
  // Host rewrite'ın kökte (`/`) de çalışması gerektiği için tüm sayfa
  // isteklerinde koş; statik dosyalar ve API'yi hariç tut.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)"],
};
