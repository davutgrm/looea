import { prisma } from "@/lib/prisma";
import type { Category } from "@/generated/prisma/client";

export const GROUP_LABELS: Record<string, string> = {
  SAC: "Saç",
  GUZELLIK: "Güzellik",
  TIRNAK: "Tırnak",
  OZEL: "Özel",
};

export async function getActiveCategories(): Promise<Category[]> {
  return prisma.category.findMany({
    where: { active: true },
    orderBy: [{ group: "asc" }, { order: "asc" }],
  });
}

export async function getCategoriesGrouped(): Promise<Record<string, Category[]>> {
  const categories = await getActiveCategories();
  const groups: Record<string, Category[]> = {};
  for (const c of categories) {
    (groups[c.group] ??= []).push(c);
  }
  return groups;
}
