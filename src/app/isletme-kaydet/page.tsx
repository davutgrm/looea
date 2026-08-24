import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterBusinessForm } from "@/components/auth/register-business-form";

export default function RegisterBusinessPage() {
  return (
    <AuthShell
      title="İşini büyüt, takvimini doldur."
      subtitle="İlk ay ücretsiz — taahhüt yok."
      footer={
        <>
          Zaten hesabın var mı? <Link href="/giris" className="font-medium text-app-accent hover:underline">Giriş Yap</Link>
        </>
      }
    >
      <RegisterBusinessForm />
    </AuthShell>
  );
}
