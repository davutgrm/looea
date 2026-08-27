"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { upsertBusinessCustomer } from "@/lib/actions/business";

export function AddCustomerButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="accent" onClick={() => setOpen(true)} className="gap-1.5">
        <Plus className="size-4" /> Müşteri Ekle
      </Button>
      {open && <AddCustomerDialog open={open} onOpenChange={setOpen} />}
    </>
  );
}

function AddCustomerDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit() {
    if (!name.trim()) {
      toast.error("İsim gerekli");
      return;
    }
    if (!phone.trim()) {
      toast.error("Telefon gerekli");
      return;
    }
    startTransition(async () => {
      const result = await upsertBusinessCustomer({ name, phone, email });
      if (result.success) {
        toast.success("Müşteri eklendi");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Yeni Müşteri</DialogTitle>
          <DialogDescription>Müşteri bir hesap açmadan salonunuzun kayıtlarına eklenir.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="customer-name">İsim</Label>
            <Input id="customer-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="customer-phone">Telefon</Label>
            <div className="flex items-center gap-2">
              <span className="shrink-0 rounded-lg border border-border px-2.5 py-2 text-sm text-muted-foreground">
                +90
              </span>
              <Input
                id="customer-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="5xx xxx xx xx"
                inputMode="tel"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="customer-email">E-posta (opsiyonel)</Label>
            <Input id="customer-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="accent" disabled={isPending} onClick={submit}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Ekle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
