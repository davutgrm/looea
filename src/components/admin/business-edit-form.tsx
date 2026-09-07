"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateBusiness } from "@/lib/actions/admin";
import { BUSINESS_TYPE_OPTIONS } from "@/lib/business-types";
import type { BusinessType } from "@/generated/prisma/client";

type FormState = {
  name: string;
  type: BusinessType;
  phone: string;
  email: string;
  instagram: string;
  website: string;
  description: string;
};

export function BusinessEditForm({
  businessId,
  initial,
}: {
  businessId: string;
  initial: FormState;
}) {
  const [form, setForm] = useState<FormState>(initial);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateBusiness({ businessId, ...form });
      if (!result.success) toast.error(result.error);
      else toast.success("İşletme bilgileri güncellendi");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="İşletme Adı" htmlFor="business-name" required>
          <Input
            id="business-name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        </Field>
        <Field label="İşletme Türü">
          <Select
            value={form.type}
            onValueChange={(v) => setForm((f) => ({ ...f, type: v as BusinessType }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BUSINESS_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Telefon" htmlFor="business-phone">
          <Input
            id="business-phone"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </Field>
        <Field label="Email" htmlFor="business-email">
          <Input
            id="business-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </Field>
        <Field label="Instagram" htmlFor="business-instagram">
          <Input
            id="business-instagram"
            value={form.instagram}
            onChange={(e) => setForm((f) => ({ ...f, instagram: e.target.value }))}
          />
        </Field>
        <Field label="Website" htmlFor="business-website">
          <Input
            id="business-website"
            value={form.website}
            onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
          />
        </Field>
      </div>
      <Field label="Açıklama" htmlFor="business-description">
        <Textarea
          id="business-description"
          rows={4}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
      </Field>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
      </Button>
    </form>
  );
}
