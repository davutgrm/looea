"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Star, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toggleReviewHidden, deleteReview } from "@/lib/actions/admin";

export type ReviewRow = {
  id: string;
  rating: number;
  comment: string | null;
  hidden: boolean;
  createdAtLabel: string;
  businessName: string;
  customerName: string;
};

export function ReviewsTable({ reviews }: { reviews: ReviewRow[] }) {
  return (
    <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>İşletme</TableHead>
            <TableHead>Müşteri</TableHead>
            <TableHead>Puan</TableHead>
            <TableHead>Yorum</TableHead>
            <TableHead>Tarih</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead className="text-right">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.map((r) => (
            <ReviewRowItem key={r.id} review={r} />
          ))}
          {reviews.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                Yorum bulunamadı.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function ReviewRowItem({ review }: { review: ReviewRow }) {
  const [isPending, startTransition] = useTransition();
  const [hidden, setHidden] = useState(review.hidden);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function handleToggleHidden() {
    const next = !hidden;
    setHidden(next);
    startTransition(async () => {
      const result = await toggleReviewHidden(review.id);
      if (!result.success) {
        setHidden(!next);
        toast.error(result.error);
      } else {
        toast.success(next ? "Yorum gizlendi" : "Yorum tekrar görünür yapıldı");
      }
    });
  }

  function handleDelete() {
    setDeleting(true);
    startTransition(async () => {
      const result = await deleteReview(review.id);
      setDeleting(false);
      if (!result.success) {
        toast.error(result.error);
      } else {
        toast.success("Yorum silindi");
        setDeleteOpen(false);
      }
    });
  }

  return (
    <TableRow>
      <TableCell className="text-sm font-medium">{review.businessName}</TableCell>
      <TableCell className="text-sm">{review.customerName}</TableCell>
      <TableCell>
        <span className="flex items-center gap-1 text-sm">
          <Star className="size-3.5 fill-primary text-primary" />
          {review.rating}
        </span>
      </TableCell>
      <TableCell className="max-w-xs">
        <p className="truncate text-sm text-muted-foreground">{review.comment || "—"}</p>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">{review.createdAtLabel}</TableCell>
      <TableCell>
        <Badge variant={hidden ? "destructive" : "secondary"}>{hidden ? "Gizli" : "Görünür"}</Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon-sm" disabled={isPending} onClick={handleToggleHidden}>
            {hidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>

        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yorumu sil</DialogTitle>
              <DialogDescription>
                Bu yorumu kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
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
