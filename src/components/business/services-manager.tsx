"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Scissors } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ServiceFormDialog, type ServiceRow } from "@/components/business/service-form-dialog";
import { EmptyState } from "@/components/business/empty-state";
import { Price } from "@/components/business/price";
import { toggleServiceActive } from "@/lib/actions/business";

export function ServicesManager({
  services,
  categories,
  staffOptions,
}: {
  services: (ServiceRow & { categoryName: string })[];
  categories: { id: string; name: string }[];
  staffOptions: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceRow | null>(null);
  const [, startTransition] = useTransition();

  function openCreate() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(s: ServiceRow) {
    setEditing(s);
    setOpen(true);
  }

  function handleToggle(id: string, active: boolean) {
    startTransition(async () => {
      const result = await toggleServiceActive(id, active);
      if (result.success) {
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{services.length} hizmet</p>
        <Button variant="accent" onClick={openCreate}>
          <Plus /> Yeni Hizmet
        </Button>
      </div>

      {services.length === 0 ? (
        <EmptyState
          icon={Scissors}
          title="Henüz hizmet eklemedin"
          description="Müşterilerin randevu alabilmesi için en az bir hizmet ekle."
          action={
            <Button variant="accent" size="sm" onClick={openCreate}>
              <Plus /> İlk hizmetini ekle
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((s) => (
            <Card key={s.id}>
              <CardContent className="flex flex-col gap-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="font-medium">{s.name}</span>
                    <Badge variant="outline" className="mt-1 w-fit">
                      {s.categoryName}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="icon-sm" onClick={() => openEdit(s)}>
                    <Pencil className="size-4" />
                  </Button>
                </div>
                <p className="line-clamp-2 text-xs text-muted-foreground">{s.description || "Açıklama yok"}</p>
                <div className="flex items-center justify-between text-sm">
                  <span>{s.durationMinutes} dk</span>
                  <span className="font-semibold"><Price amount={s.price} /></span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-2.5">
                  <span className="text-xs text-muted-foreground">Aktif</span>
                  <Switch
                    checked={s.active}
                    onCheckedChange={(v) => handleToggle(s.id, v)}
                    className="data-checked:bg-app-accent"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ServiceFormDialog
        open={open}
        onOpenChange={setOpen}
        service={editing}
        categories={categories}
        staffOptions={staffOptions}
      />
    </div>
  );
}
