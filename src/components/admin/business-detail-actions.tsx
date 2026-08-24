"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShieldCheck, ShieldOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toggleBusinessVerified, toggleBusinessActive, deleteBusiness } from "@/lib/actions/admin";

export function BusinessDetailActions({
  businessId,
  businessName,
  initialVerified,
  initialActive,
}: {
  businessId: string;
  businessName: string;
  initialVerified: boolean;
  initialActive: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [verified, setVerified] = useState(initialVerified);
  const [active, setActive] = useState(initialActive);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function handleToggleVerified() {
    const next = !verified;
    setVerified(next);
    startTransition(async () => {
      const result = await toggleBusinessVerified(businessId);
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
      const result = await toggleBusinessActive(businessId);
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
      const result = await deleteBusiness(businessId);
      setDeleting(false);
      if (!result.success) {
        toast.error(result.error);
      } else {
        toast.success("İşletme silindi");
        router.push("/admin/isletmeler");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="outline" onClick={handleToggleVerified} disabled={isPending}>
        {verified ? <ShieldOff /> : <ShieldCheck />}
        {verified ? "Doğrulamayı Kaldır" : "Doğrula"}
      </Button>
      <div className="flex items-center gap-2 rounded-lg border border-input px-3 py-1.5">
        <span className="text-sm">{active ? "Aktif" : "Askıda"}</span>
        <Switch checked={active} onCheckedChange={handleToggleActive} disabled={isPending} />
      </div>
      <Button variant="destructive" onClick={() => setDeleteOpen(true)} disabled={isPending}>
        <Trash2 />
        Sil
      </Button>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>İşletmeyi sil</DialogTitle>
            <DialogDescription>
              <strong>{businessName}</strong> işletmesini ve tüm bağlı verilerini (hizmetler,
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
    </div>
  );
}
