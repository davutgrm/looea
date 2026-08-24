"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateBusinessProfile } from "@/lib/actions/business";

const formSchema = z.object({
  name: z.string().min(2, "İşletme adı en az 2 karakter olmalı"),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  coverImageUrl: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  instagram: z.string().optional(),
  website: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ProfileForm({ initialValues }: { initialValues: FormValues }) {
  const router = useRouter();
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: initialValues });

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
