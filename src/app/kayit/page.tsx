import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterCustomerForm } from "@/components/auth/register-customer-form";
import { isProRequest } from "@/lib/host";

export default async function RegisterPage() {
  // Pro host'ta müşteri kaydı yok — işletme kaydına yönlendir.
  if (await isProRequest()) redirect("/isletme-kaydet");

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
