"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Eye, MoreHorizontal, ShieldCheck, ShieldOff, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toggleBusinessVerified, toggleBusinessActive, deleteBusiness } from "@/lib/actions/admin";

export type BusinessRow = {
  id: string;
  name: string;
  slug: string;
  typeLabel: string;
  ownerName: string;
  ownerEmail: string;
  city: string | null;
  planName: string | null;
  verified: boolean;
  active: boolean;
};

export function BusinessesTable({ businesses }: { businesses: BusinessRow[] }) {
  return (
    <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>İşletme</TableHead>
            <TableHead>Sahibi</TableHead>
            <TableHead>Tür</TableHead>
            <TableHead>Şehir</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Doğrulama</TableHead>
            <TableHead>Aktif</TableHead>
            <TableHead className="text-right">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {businesses.map((b) => (
            <BusinessRowItem key={b.id} business={b} />
          ))}
          {businesses.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                İşletme bulunamadı.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function BusinessRowItem({ business }: { business: BusinessRow }) {
  const [isPending, startTransition] = useTransition();
  const [verified, setVerified] = useState(business.verified);
  const [active, setActive] = useState(business.active);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function handleToggleVerified() {
    const next = !verified;
    setVerified(next);
    startTransition(async () => {
      const result = await toggleBusinessVerified(business.id);
      if (!result.success) {
        setVerified(!next);
        toast.error(result.error);
      } else {
        toast.success(next ? "İşletme doğrulandı" : "Doğrulama kaldırıldı");
      }
    });
  }

  function handleToggleActive(next: boolean) {
    setActive(next);
    startTransition(async () => {
      const result = await toggleBusinessActive(business.id);
      if (!result.success) {
        setActive(!next);
        toast.error(result.error);
      } else {
        toast.success(next ? "İşletme aktif edildi" : "İşletme askıya alındı");
      }
    });
  }

  function handleDelete() {
    setDeleting(true);
    startTransition(async () => {
      const result = await deleteBusiness(business.id);
      setDeleting(false);
      if (!result.success) {
        toast.error(result.error);
      } else {
        toast.success("İşletme silindi");
        setDeleteOpen(false);
      }
    });
  }

  return (
    <TableRow>
      <TableCell>
        <Link href={`/admin/isletmeler/${business.id}`} className="min-w-0 hover:underline">
          <p className="truncate text-sm font-medium">{business.name}</p>
          <p className="truncate text-xs text-muted-foreground">/{business.slug}</p>
        </Link>
      </TableCell>
      <TableCell>
        <p className="truncate text-sm">{business.ownerName}</p>
        <p className="truncate text-xs text-muted-foreground">{business.ownerEmail}</p>
      </TableCell>
      <TableCell className="text-sm">{business.typeLabel}</TableCell>
      <TableCell className="text-sm">{business.city ?? "—"}</TableCell>
      <TableCell>
        {business.planName ? (
          <Badge variant="secondary">{business.planName}</Badge>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell>
        <button onClick={handleToggleVerified} disabled={isPending}>
          <Badge variant={verified ? "default" : "outline"} className="cursor-pointer">
            {verified ? "Doğrulanmış" : "Doğrulanmamış"}
          </Badge>
        </button>
      </TableCell>
      <TableCell>
        <Switch checked={active} disabled={isPending} onCheckedChange={handleToggleActive} />
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/isletmeler/${business.id}`}>
                <Eye />
                Görüntüle / Düzenle
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleToggleVerified}>
              {verified ? <ShieldOff /> : <ShieldCheck />}
              {verified ? "Doğrulamayı Kaldır" : "Doğrula"}
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
              <Trash2 />
              Sil
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>İşletmeyi sil</DialogTitle>
              <DialogDescription>
                <strong>{business.name}</strong> işletmesini ve tüm bağlı verilerini (hizmetler,
                personel, randevular, yorumlar) kalıcı olarak silmek istediğinize emin misiniz? Bu
                işlem geri alınamaz.
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
