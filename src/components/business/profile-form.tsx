"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Scissors, Sparkles, Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BUSINESS_SERVES_LABELS } from "@/lib/business-types";
import { updateBusinessProfile } from "@/lib/actions/business";

const SERVES_OPTIONS = [
  { value: "MEN" as const, icon: Scissors },
  { value: "WOMEN" as const, icon: Sparkles },
  { value: "UNISEX" as const, icon: Users },
];

const formSchema = z.object({
  name: z.string().min(2, "İşletme adı en az 2 karakter olmalı"),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  coverImageUrl: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  instagram: z.string().optional(),
  website: z.string().optional(),
  serves: z.enum(["MEN", "WOMEN", "UNISEX"]),
});

type FormValues = z.infer<typeof formSchema>;

export function ProfileForm({ initialValues }: { initialValues: FormValues }) {
  const router = useRouter();
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: initialValues });
  const serves = form.watch("serves");

  async function onSubmit(values: FormValues) {
    const result = await updateBusinessProfile(values);
    if (result.success) {
      toast.success("İşletme bilgileri güncellendi");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>İşletme Bilgileri</CardTitle>
        <CardDescription>Müşterilerinizin göreceği genel bilgiler.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="business-name">İşletme Adı</Label>
            <Input id="business-name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="business-description">Açıklama</Label>
            <Textarea id="business-description" {...form.register("description")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Kime hizmet veriyorsunuz?</Label>
            <div className="grid grid-cols-3 gap-2">
              {SERVES_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => form.setValue("serves", opt.value, { shouldDirty: true })}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 px-2 py-4 text-center transition-colors",
                    serves === opt.value
                      ? "border-app-accent bg-app-accent-soft"
                      : "border-border hover:border-app-accent/40",
                  )}
                >
                  <opt.icon className="size-5 text-app-accent" />
                  <span className="text-xs leading-tight font-semibold">{BUSINESS_SERVES_LABELS[opt.value]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="business-logo">Logo URL</Label>
              <Input id="business-logo" {...form.register("logoUrl")} placeholder="https://..." />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="business-cover">Kapak Görseli URL</Label>
              <Input id="business-cover" {...form.register("coverImageUrl")} placeholder="https://..." />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="business-phone">Telefon</Label>
              <Input id="business-phone" {...form.register("phone")} placeholder="05xx xxx xx xx" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="business-email">E-posta</Label>
              <Input id="business-email" type="email" {...form.register("email")} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="business-instagram">Instagram</Label>
              <Input id="business-instagram" {...form.register("instagram")} placeholder="@kullaniciadi" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="business-website">Web Sitesi</Label>
              <Input id="business-website" {...form.register("website")} placeholder="https://..." />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" variant="accent" disabled={form.formState.isSubmitting}>
            Kaydet
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
