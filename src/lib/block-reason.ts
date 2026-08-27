import type { BlockReason } from "@/generated/prisma/client";

export const BLOCK_REASON_LABELS: Record<BlockReason, string> = {
  LUNCH: "Öğle arası",
  TRAINING: "Eğitim",
  LEAVE: "İzin",
  EXTERNAL: "Dış randevu",
  CUSTOM: "Özel",
};
