"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { replyToReview } from "@/lib/actions/business";

export function ReviewReplyForm({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const [reply, setReply] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!reply.trim()) {
      toast.error("Yanıt boş olamaz");
      return;
    }
    startTransition(async () => {
      const result = await replyToReview(reviewId, reply.trim());
      if (result.success) {
        toast.success("Yanıtınız yayınlandı");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border p-3">
      <Textarea
        placeholder="Bu yoruma yanıt yazın..."
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        className="min-h-14"
      />
      <Button type="button" variant="accent" size="sm" className="self-end" disabled={isPending} onClick={handleSubmit}>
        Yanıtla
      </Button>
    </div>
  );
}
