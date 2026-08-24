"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryActive,
  moveCategory,
} from "@/lib/actions/admin";

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  group: string;
  order: number;
  active: boolean;
  serviceCount: number;
};

const GROUP_LABELS: Record<string, string> = {
  SAC: "Saç",
  GUZELLIK: "Güzellik",
  TIRNAK: "Tırnak",
  OZEL: "Özel",
};

const GROUP_OPTIONS = Object.entries(GROUP_LABELS);

export function CategoriesManager({ categories }: { categories: CategoryRow[] }) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus />
              Yeni Kategori
            </Button>
          </DialogTrigger>
          <CategoryFormDialog mode="create" onClose={() => setCreateOpen(false)} />
        </Dialog>
      </div>

      <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kategori</TableHead>
              <TableHead>Grup</TableHead>
              <TableHead>Sıra</TableHead>
              <TableHead>Hizmet Sayısı</TableHead>
              <TableHead>Aktif</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((c) => (
              <CategoryRowItem key={c.id} category={c} />
            ))}
            {categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  Henüz kategori eklenmemiş.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function CategoryRowItem({ category }: { category: CategoryRow }) {
  const [isPending, startTransition] = useTransition();
  const [active, setActive] = useState(category.active);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function handleToggleActive(next: boolean) {
    setActive(next);
    startTransition(async () => {
      const result = await toggleCategoryActive(category.id);
      if (!result.success) {
        setActive(!next);
        toast.error(result.error);
      }
    });
  }

  function handleMove(direction: "up" | "down") {
    startTransition(async () => {
      const result = await moveCategory(category.id, direction);
      if (!result.success) toast.error(result.error);
    });
  }

  function handleDelete() {
    setDeleting(true);
    startTransition(async () => {
      const result = await deleteCategory(category.id);
      setDeleting(false);
      if (!result.success) {
        toast.error(result.error);
      } else {
        toast.success("Kategori silindi");
        setDeleteOpen(false);
      }
    });
  }

  return (
    <TableRow>
      <TableCell>
        <p className="text-sm font-medium">{category.name}</p>
        <p className="text-xs text-muted-foreground">/{category.slug}</p>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{GROUP_LABELS[category.group] ?? category.group}</Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <span className="w-6 text-sm tabular-nums">{category.order}</span>
          <Button variant="ghost" size="icon-xs" disabled={isPending} onClick={() => handleMove("up")}>
            <ArrowUp className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon-xs" disabled={isPending} onClick={() => handleMove("down")}>
            <ArrowDown className="size-3.5" />
          </Button>
        </div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">{category.serviceCount}</TableCell>
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
            <CategoryFormDialog mode="edit" category={category} onClose={() => setEditOpen(false)} />
          </Dialog>
          <Button variant="ghost" size="icon-sm" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>

        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Kategoriyi sil</DialogTitle>
              <DialogDescription>
                <strong>{category.name}</strong> kategorisini silmek istediğinize emin misiniz?
                {category.serviceCount > 0 &&
                  " Bu kategoriye bağlı hizmetler olduğu için silme işlemi başarısız olabilir."}
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

function CategoryFormDialog({
  mode,
  category,
  onClose,
}: {
  mode: "create" | "edit";
  category?: CategoryRow;
  onClose: () => void;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [group, setGroup] = useState(category?.group ?? "SAC");
  const [order, setOrder] = useState(category?.order ?? 0);
  const [active, setActive] = useState(category?.active ?? true);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createCategory({ name, group, order, active })
          : await updateCategory({ id: category!.id, name, group, order, active });
      if (!result.success) {
        toast.error(result.error);
      } else {
        toast.success(mode === "create" ? "Kategori oluşturuldu" : "Kategori güncellendi");
        onClose();
      }
    });
  }

  return (
    <DialogContent>
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Yeni Kategori" : "Kategoriyi Düzenle"}</DialogTitle>
          <DialogDescription>Kategori bilgilerini girin. Slug otomatik oluşturulur.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="cat-name">Kategori Adı</Label>
            <Input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label>Grup</Label>
            <Select value={group} onValueChange={setGroup}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GROUP_OPTIONS.map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cat-order">Sıra</Label>
            <Input
              id="cat-order"
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-input px-3 py-2">
            <Label htmlFor="cat-active" className="cursor-pointer">
              Aktif
            </Label>
            <Switch id="cat-active" checked={active} onCheckedChange={setActive} />
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
