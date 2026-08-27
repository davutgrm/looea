"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteBlockedSlot } from "@/lib/actions/business";

export function DeleteBlockedSlotButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteBlockedSlot(id);
      if (result.success) {
        toast.success("Bloke slot kaldırıldı");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Button type="button" variant="ghost" size="icon-sm" disabled={isPending} onClick={handleDelete}>
      <Trash2 className="size-4 text-destructive" />
    </Button>
  );
}
