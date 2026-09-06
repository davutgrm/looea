import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { AuthDivider } from "@/components/auth/auth-divider";
import { isProRequest } from "@/lib/host";
import { proHref } from "@/lib/domains";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const [{ callbackUrl }, pro] = await Promise.all([searchParams, isProRequest()]);
  const googleEnabled = !!process.env.AUTH_GOOGLE_ID && !!process.env.AUTH_GOOGLE_SECRET;

  return (
    <AuthShell
      title="Tekrar hoş geldin."
      subtitle={
        pro
          ? "İşletme paneline giriş yap, takvimini ve randevularını yönet."
          : "Randevularını yönet ya da yeni bir kuaför keşfet — hepsi tek yerde."
      }
      footer={
        pro ? (
          <>
            Hesabın yok mu? <Link href="/isletme-kaydet" className="font-medium text-app-accent hover:underline">İşletmeni Kaydet</Link>
          </>
        ) : (
          <>
            Hesabın yok mu? <Link href="/kayit" className="font-medium text-app-accent hover:underline">Kayıt Ol</Link>
            <br />
            İşletme misin? <a href={proHref("/isletme-kaydet")} className="font-medium text-app-accent hover:underline">İşletmeni Kaydet</a>
          </>
        )
      }
    >
      <LoginForm callbackUrl={callbackUrl} />
      {!pro && googleEnabled && (
        <>
          <AuthDivider />
          <GoogleSignInButton callbackUrl={callbackUrl ?? "/kesfet"} label="Google ile giriş yap" />
        </>
      )}
    </AuthShell>
  );
}
