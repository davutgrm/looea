"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BUSINESS_TYPE_OPTIONS } from "@/lib/business-types";
import { registerBusiness } from "@/lib/actions/auth";

export function RegisterBusinessForm() {
  const router = useRouter();
  const [values, setValues] = useState({
    ownerName: "",
    email: "",
    password: "",
    businessName: "",
    businessType: "WOMEN_SALON" as const,
  });
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await registerBusiness(values);
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
      toast.success("İşletmen oluşturuldu!");
      router.push("/business");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="businessName">İşletme Adı</Label>
        <Input
          id="businessName"
          required
          value={values.businessName}
          onChange={(e) => setValues((v) => ({ ...v, businessName: e.target.value }))}
          className="focus-visible:border-app-accent focus-visible:ring-app-accent/50"
        />
      </div>
      <div className="space-y-1.5">
        <Label>İşletme Türü</Label>
        <Select value={values.businessType} onValueChange={(v) => setValues((val) => ({ ...val, businessType: v as typeof values.businessType }))}>
          <SelectTrigger className="w-full focus-visible:border-app-accent focus-visible:ring-app-accent/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BUSINESS_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ownerName">Yetkili İsim Soyisim</Label>
        <Input
          id="ownerName"
          required
          value={values.ownerName}
          onChange={(e) => setValues((v) => ({ ...v, ownerName: e.target.value }))}
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
        İşletmeni Kaydet
      </Button>
    </form>
  );
}
