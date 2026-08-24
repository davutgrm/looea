"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/lib/actions/customer";

export function ProfileForm({ name, phone }: { name: string; phone: string }) {
  const [values, setValues] = useState({ name, phone });
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const res = await updateProfile(values);
          if (res.success) toast.success("Bilgileriniz güncellendi");
          else toast.error(res.error);
        });
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="name">İsim</Label>
        <Input id="name" value={values.name} onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone">Telefon</Label>
        <Input id="phone" value={values.phone} onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))} />
      </div>
      <Button type="submit" variant="accent" disabled={isPending}>Kaydet</Button>
    </form>
  );
}
