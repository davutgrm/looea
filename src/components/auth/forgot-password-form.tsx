"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, MailCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/lib/actions/auth";
import { btn } from "@/lib/design-tokens";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await requestPasswordReset({ email });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      setSent(true);
    });
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-app-accent-soft text-app-accent-soft-foreground">
          <MailCheck className="size-6" />
        </div>
        <p className="mt-4 font-grotesk font-semibold">Bağlantıyı gönderdik</p>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Eğer <span className="font-medium text-foreground">{email}</span> ile kayıtlı bir hesap
          varsa, şifre sıfırlama bağlantısını e-postana gönderdik.
        </p>
        <Link href="/giris" className={`${btn.primary} mt-6 w-full`}>
          Girişe dön
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ornek@isletme.com"
          className="focus-visible:border-app-accent focus-visible:ring-app-accent/50"
        />
      </div>
      <button type="submit" disabled={isPending} className={`${btn.primary} w-full`}>
        {isPending && <Loader2 className="size-4 animate-spin" />}
        Sıfırlama bağlantısı gönder
      </button>
    </form>
  );
}
