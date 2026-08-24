"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { upsertService } from "@/lib/actions/business";

const formSchema = z.object({
  name: z.string().min(2, "Hizmet adı en az 2 karakter olmalı"),
  categoryId: z.string().min(1, "Kategori seçin"),
  description: z.string().optional(),
  durationMinutes: z.number().int().min(5, "Süre en az 5 dakika olmalı").max(600),
  price: z.number().min(0, "Fiyat 0'dan küçük olamaz"),
  imageUrl: z.string().optional(),
  active: z.boolean(),
  staffIds: z.array(z.string()),
});

type FormValues = z.infer<typeof formSchema>;

export type ServiceRow = {
  id: string;
  name: string;
  categoryId: string;
  description: string | null;
  durationMinutes: number;
  price: number;
  imageUrl: string | null;
  active: boolean;
  staffIds: string[];
};

const EMPTY_VALUES: FormValues = {
  name: "",
  categoryId: "",
  description: "",
  durationMinutes: 30,
  price: 0,
  imageUrl: "",
  active: true,
  staffIds: [],
};

export function ServiceFormDialog({
  open,
  onOpenChange,
  service,
  categories,
  staffOptions,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: ServiceRow | null;
  categories: { id: string; name: string }[];
  staffOptions: { id: string; name: string }[];
}) {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      service
        ? {
            name: service.name,
            categoryId: service.categoryId,
            description: service.description ?? "",
            durationMinutes: service.durationMinutes,
            price: service.price,
            imageUrl: service.imageUrl ?? "",
            active: service.active,
            staffIds: service.staffIds,
          }
        : EMPTY_VALUES,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, service]);

  async function onSubmit(values: FormValues) {
    const result = await upsertService({ id: service?.id, ...values });
    if (result.success) {
      toast.success(service ? "Hizmet güncellendi" : "Hizmet eklendi");
      onOpenChange(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  const staffIds = form.watch("staffIds");

  function toggleStaff(id: string) {
    const current = form.getValues("staffIds");
    form.setValue("staffIds", current.includes(id) ? current.filter((s) => s !== id) : [...current, id], {
      shouldDirty: true,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{service ? "Hizmeti Düzenle" : "Yeni Hizmet"}</DialogTitle>
          <DialogDescription>Hizmet bilgilerini girin.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto pr-1">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="service-name">Hizmet Adı</Label>
            <Input id="service-name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Kategori</Label>
            <Select
              value={form.watch("categoryId")}
              onValueChange={(v) => form.setValue("categoryId", v, { shouldDirty: true })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Kategori seçin" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.categoryId && (
              <p className="text-xs text-destructive">{form.formState.errors.categoryId.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="service-description">Açıklama</Label>
            <Textarea id="service-description" {...form.register("description")} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="service-duration">Süre (dk)</Label>
              <Input
                id="service-duration"
                type="number"
                {...form.register("durationMinutes", { valueAsNumber: true })}
              />
              {form.formState.errors.durationMinutes && (
                <p className="text-xs text-destructive">{form.formState.errors.durationMinutes.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="service-price">Fiyat (<span className="font-sans">₺</span>)</Label>
              <Input
                id="service-price"
                type="number"
                step="0.01"
                {...form.register("price", { valueAsNumber: true })}
              />
              {form.formState.errors.price && (
                <p className="text-xs text-destructive">{form.formState.errors.price.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="service-image">Görsel URL</Label>
            <Input id="service-image" {...form.register("imageUrl")} placeholder="https://..." />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Hizmeti Verebilecek Çalışanlar</Label>
            <div className="flex max-h-36 flex-col gap-1.5 overflow-y-auto rounded-lg border border-border p-2.5">
              {staffOptions.length === 0 ? (
                <span className="text-xs text-muted-foreground">Önce çalışan ekleyin.</span>
              ) : (
                staffOptions.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={staffIds.includes(s.id)} onCheckedChange={() => toggleStaff(s.id)} />
                    {s.name}
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-2.5">
            <Label htmlFor="service-active">Aktif</Label>
            <Switch
              id="service-active"
              checked={form.watch("active")}
              onCheckedChange={(v) => form.setValue("active", v, { shouldDirty: true })}
              className="data-checked:bg-app-accent"
            />
          </div>

          <DialogFooter>
            <Button type="submit" variant="accent" disabled={form.formState.isSubmitting}>
              {service ? "Kaydet" : "Ekle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
