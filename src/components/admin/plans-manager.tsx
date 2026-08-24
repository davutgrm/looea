"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createPlan, updatePlan, deletePlan, togglePlanActive, movePlan } from "@/lib/actions/admin";
import { Price } from "@/components/admin/price";

export type PlanRow = {
  id: string;
  name: string;
  slug: string;
  price: number;
  billingPeriod: string;
  features: string[];
  order: number;
  active: boolean;
  subscriptionCount: number;
};

const BILLING_LABELS: Record<string, string> = {
  MONTHLY: "Aylık",
  YEARLY: "Yıllık",
};

export function PlansManager({ plans }: { plans: PlanRow[] }) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus />
              Yeni Plan
            </Button>
          </DialogTrigger>
          <PlanFormDialog mode="create" onClose={() => setCreateOpen(false)} />
        </Dialog>
      </div>

      <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan</TableHead>
              <TableHead>Fiyat</TableHead>
              <TableHead>Periyot</TableHead>
              <TableHead>Sıra</TableHead>
              <TableHead>Aboneler</TableHead>
              <TableHead>Aktif</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((p) => (
              <PlanRowItem key={p.id} plan={p} />
            ))}
            {plans.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  Henüz plan eklenmemiş.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function PlanRowItem({ plan }: { plan: PlanRow }) {
  const [isPending, startTransition] = useTransition();
  const [active, setActive] = useState(plan.active);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function handleToggleActive(next: boolean) {
    setActive(next);
    startTransition(async () => {
      const result = await togglePlanActive(plan.id);
      if (!result.success) {
        setActive(!next);
        toast.error(result.error);
      }
    });
  }

  function handleMove(direction: "up" | "down") {
    startTransition(async () => {
      const result = await movePlan(plan.id, direction);
      if (!result.success) toast.error(result.error);
    });
  }

  function handleDelete() {
    setDeleting(true);
    startTransition(async () => {
      const result = await deletePlan(plan.id);
      setDeleting(false);
      if (!result.success) {
        toast.error(result.error);
      } else {
        toast.success("Plan silindi");
        setDeleteOpen(false);
      }
    });
  }

  return (
    <TableRow>
      <TableCell>
        <p className="text-sm font-medium">{plan.name}</p>
        <p className="text-xs text-muted-foreground">/{plan.slug}</p>
      </TableCell>
      <TableCell className="text-sm"><Price amount={plan.price} /></TableCell>
      <TableCell className="text-sm">{BILLING_LABELS[plan.billingPeriod] ?? plan.billingPeriod}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <span className="w-6 text-sm tabular-nums">{plan.order}</span>
          <Button variant="ghost" size="icon-xs" disabled={isPending} onClick={() => handleMove("up")}>
            <ArrowUp className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon-xs" disabled={isPending} onClick={() => handleMove("down")}>
            <ArrowDown className="size-3.5" />
          </Button>
        </div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">{plan.subscriptionCount}</TableCell>
      <TableCell>
        <Switch checked={active} disabled={isPending} onCheckedChange={handleToggleActive} />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <Pencil className="size-4" />
              </Button>
            </DialogTrigger>
            <PlanFormDialog mode="edit" plan={plan} onClose={() => setEditOpen(false)} />
          </Dialog>
          <Button variant="ghost" size="icon-sm" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>

        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Planı sil</DialogTitle>
              <DialogDescription>
                <strong>{plan.name}</strong> planını silmek istediğinize emin misiniz?
                {plan.subscriptionCount > 0 &&
                  " Bu plana bağlı abonelikler olduğu için silme işlemi başarısız olabilir."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter showCloseButton>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Siliniyor..." : "Evet, sil"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TableCell>
    </TableRow>
  );
}

function PlanFormDialog({
  mode,
  plan,
  onClose,
}: {
  mode: "create" | "edit";
  plan?: PlanRow;
  onClose: () => void;
}) {
  const [name, setName] = useState(plan?.name ?? "");
  const [price, setPrice] = useState(plan?.price ?? 0);
  const [billingPeriod, setBillingPeriod] = useState(plan?.billingPeriod ?? "MONTHLY");
  const [featuresText, setFeaturesText] = useState((plan?.features ?? []).join("\n"));
  const [order, setOrder] = useState(plan?.order ?? 0);
  const [active, setActive] = useState(plan?.active ?? true);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const features = featuresText
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createPlan({ name, price, billingPeriod, features, order, active })
          : await updatePlan({ id: plan!.id, name, price, billingPeriod, features, order, active });
      if (!result.success) {
        toast.error(result.error);
      } else {
        toast.success(mode === "create" ? "Plan oluşturuldu" : "Plan güncellendi");
        onClose();
      }
    });
  }

  return (
    <DialogContent>
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Yeni Plan" : "Planı Düzenle"}</DialogTitle>
          <DialogDescription>Abonelik planı bilgilerini girin.</DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] space-y-4 overflow-y-auto py-2">
          <div className="space-y-1.5">
            <Label htmlFor="plan-name">Plan Adı</Label>
            <Input id="plan-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="plan-price">Fiyat (<span className="font-sans">₺</span>)</Label>
              <Input
                id="plan-price"
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Periyot</Label>
              <Select value={billingPeriod} onValueChange={setBillingPeriod}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTHLY">Aylık</SelectItem>
                  <SelectItem value="YEARLY">Yıllık</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="plan-features">Özellikler (her satıra bir tane)</Label>
            <Textarea
              id="plan-features"
              rows={5}
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              placeholder={"Sınırsız randevu\nÖncelikli destek\nSMS bildirimleri"}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="plan-order">Sıra</Label>
            <Input
              id="plan-order"
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-input px-3 py-2">
            <Label htmlFor="plan-active" className="cursor-pointer">
              Aktif
            </Label>
            <Switch id="plan-active" checked={active} onCheckedChange={setActive} />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Kaydediliyor..." : mode === "create" ? "Oluştur" : "Kaydet"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
