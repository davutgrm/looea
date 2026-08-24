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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { upsertStaff } from "@/lib/actions/business";

const formSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalı"),
  title: z.string().optional(),
  avatarUrl: z.string().optional(),
  active: z.boolean(),
  serviceIds: z.array(z.string()),
});

type FormValues = z.infer<typeof formSchema>;

export type StaffRow = {
  id: string;
  name: string;
  title: string | null;
  avatarUrl: string | null;
  active: boolean;
  serviceIds: string[];
};

const EMPTY_VALUES: FormValues = {
  name: "",
  title: "",
  avatarUrl: "",
  active: true,
  serviceIds: [],
};

export function StaffFormDialog({
  open,
  onOpenChange,
  staff,
  serviceOptions,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: StaffRow | null;
  serviceOptions: { id: string; name: string }[];
}) {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      staff
        ? {
            name: staff.name,
            title: staff.title ?? "",
            avatarUrl: staff.avatarUrl ?? "",
            active: staff.active,
            serviceIds: staff.serviceIds,
          }
        : EMPTY_VALUES,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, staff]);

  async function onSubmit(values: FormValues) {
    const result = await upsertStaff({ id: staff?.id, ...values });
    if (result.success) {
      toast.success(staff ? "Çalışan güncellendi" : "Çalışan eklendi");
      onOpenChange(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  const serviceIds = form.watch("serviceIds");

  function toggleService(id: string) {
    const current = form.getValues("serviceIds");
    form.setValue(
      "serviceIds",
      current.includes(id) ? current.filter((s) => s !== id) : [...current, id],
      { shouldDirty: true },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{staff ? "Çalışanı Düzenle" : "Yeni Çalışan"}</DialogTitle>
          <DialogDescription>Çalışan bilgilerini girin.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto pr-1">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="staff-name">Ad Soyad</Label>
            <Input id="staff-name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="staff-title">Unvan / Uzmanlık</Label>
            <Input id="staff-title" {...form.register("title")} placeholder="Örn. Kuaför, Berber" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="staff-avatar">Fotoğraf URL</Label>
            <Input id="staff-avatar" {...form.register("avatarUrl")} placeholder="https://..." />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Verebileceği Hizmetler</Label>
            <div className="flex max-h-36 flex-col gap-1.5 overflow-y-auto rounded-lg border border-border p-2.5">
              {serviceOptions.length === 0 ? (
                <span className="text-xs text-muted-foreground">Önce hizmet ekleyin.</span>
              ) : (
                serviceOptions.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={serviceIds.includes(s.id)} onCheckedChange={() => toggleService(s.id)} />
                    {s.name}
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-2.5">
            <Label htmlFor="staff-active">Aktif</Label>
            <Switch
              id="staff-active"
              checked={form.watch("active")}
              onCheckedChange={(v) => form.setValue("active", v, { shouldDirty: true })}
              className="data-checked:bg-app-accent"
            />
          </div>

          <DialogFooter>
            <Button type="submit" variant="accent" disabled={form.formState.isSubmitting}>
              {staff ? "Kaydet" : "Ekle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
