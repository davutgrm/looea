"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { btn } from "@/lib/design-tokens";
import { formatRetryAfter } from "@/lib/rate-limit-config";

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) {
        if (res.code?.startsWith("rate_limited:")) {
          const seconds = parseInt(res.code.split(":")[1], 10);
          toast.error(`Çok fazla deneme yaptınız. ${formatRetryAfter(seconds)} sonra tekrar deneyin.`);
        } else {
          toast.error("Email veya şifre hatalı");
        }
        return;
      }
      const session = await getSession();
      if (callbackUrl) {
        router.push(callbackUrl);
      } else if (session?.user.role === "ADMIN") {
        router.push("/admin");
      } else if (session?.user.role === "BUSINESS_OWNER") {
        router.push("/business");
      } else {
        router.push("/kesfet");
      }
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="focus-visible:border-app-accent focus-visible:ring-app-accent/50"
        />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Şifre</Label>
          <Link href="/sifremi-unuttum" className="text-xs font-medium text-app-accent hover:underline">
            Şifremi unuttum?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="focus-visible:border-app-accent focus-visible:ring-app-accent/50"
        />
      </div>
      <button type="submit" disabled={isPending} className={`${btn.primary} w-full`}>
        {isPending && <Loader2 className="size-4 animate-spin" />}
        Giriş Yap
      </button>
    </form>
  );
}
