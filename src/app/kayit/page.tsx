import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterCustomerForm } from "@/components/auth/register-customer-form";

export default function RegisterPage() {
  return (
    <AuthShell
      title="Yakınındaki en iyi kuaförü bul."
      subtitle="Çalışmaları gör, fiyatları karşılaştır, randevunu saniyeler içinde oluştur."
      footer={
        <>
          Zaten hesabın var mı? <Link href="/giris" className="font-medium text-app-accent hover:underline">Giriş Yap</Link>
        </>
      }
    >
      <RegisterCustomerForm />
    </AuthShell>
  );
}
