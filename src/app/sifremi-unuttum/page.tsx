import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Şifremi Unuttum — Looea",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Şifreni mi unuttun?"
      subtitle="Email adresini gir, sana şifre sıfırlama bağlantısı gönderelim."
      footer={
        <>
          Hatırladın mı? <Link href="/giris" className="font-medium text-app-accent hover:underline">Giriş Yap</Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
