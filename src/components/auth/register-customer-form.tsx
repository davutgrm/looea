"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerCustomer } from "@/lib/actions/auth";

export function RegisterCustomerForm() {
  const router = useRouter();
  const [values, setValues] = useState({ name: "", email: "", phone: "", password: "" });
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await registerCustomer(values);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      const signInRes = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });
      if (signInRes?.error) {
        toast.error("Kayıt oluşturuldu ama giriş yapılamadı, lütfen giriş yapın");
        router.push("/giris");
        return;
      }
      router.push("/onboarding");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">İsim Soyisim</Label>
        <Input
          id="name"
          required
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          className="focus-visible:border-app-accent focus-visible:ring-app-accent/50"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          className="focus-visible:border-app-accent focus-visible:ring-app-accent/50"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone">Telefon (opsiyonel)</Label>
        <Input
          id="phone"
          value={values.phone}
          onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
          className="focus-visible:border-app-accent focus-visible:ring-app-accent/50"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Şifre</Label>
        <Input
          id="password"
          type="password"
          required
          minLength={6}
          value={values.password}
          onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
          className="focus-visible:border-app-accent focus-visible:ring-app-accent/50"
        />
      </div>
      <Button type="submit" variant="accent" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="size-4 animate-spin" />}
        Kayıt Ol
      </Button>
    </form>
  );
}
