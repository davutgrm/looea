import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <AuthShell
      title="Tekrar hoş geldin."
      subtitle="Randevularını yönet ya da yeni bir kuaför keşfet — hepsi tek yerde."
      footer={
        <>
          Hesabın yok mu? <Link href="/kayit" className="font-medium text-app-accent hover:underline">Kayıt Ol</Link>
          <br />
          İşletme misin? <Link href="/isletme-kaydet" className="font-medium text-app-accent hover:underline">İşletmeni Kaydet</Link>
        </>
      }
    >
      <LoginForm callbackUrl={callbackUrl} />
    </AuthShell>
  );
}
