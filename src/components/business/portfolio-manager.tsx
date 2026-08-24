"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowUp, ArrowDown, ImageOff, Images } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { EmptyState } from "@/components/business/empty-state";
import { addPortfolioImage, deletePortfolioImage, movePortfolioImage } from "@/lib/actions/business";

export type PortfolioRow = {
  id: string;
  imageUrl: string;
  order: number;
  categoryId: string | null;
  categoryName: string | null;
};

export function PortfolioManager({
  images,
  categories,
}: {
  images: PortfolioRow[];
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState<string>("NONE");
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    if (!imageUrl.trim()) {
      toast.error("Görsel URL'si gerekli");
      return;
    }
    startTransition(async () => {
      const result = await addPortfolioImage({
        imageUrl: imageUrl.trim(),
        categoryId: categoryId === "NONE" ? undefined : categoryId,
      });
      if (result.success) {
        toast.success("Görsel eklendi");
        setImageUrl("");
        setCategoryId("NONE");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deletePortfolioImage(id);
      if (result.success) {
        toast.success("Görsel silindi");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleMove(id: string, direction: "up" | "down") {
    startTransition(async () => {
      const result = await movePortfolioImage(id, direction);
      if (result.success) {
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Yeni Görsel Ekle</CardTitle>
          <CardDescription>Görselin URL adresini girin (dosya yükleme henüz desteklenmiyor).</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex flex-1 flex-col gap-1.5">
            <Label htmlFor="portfolio-url">Görsel URL</Label>
            <Input
              id="portfolio-url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="flex w-full flex-col gap-1.5 sm:w-52">
            <Label>Kategori (opsiyonel)</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Kategori seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">Kategorisiz</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="button" variant="accent" onClick={handleAdd} disabled={isPending}>
            <Plus /> Ekle
          </Button>
        </CardContent>
      </Card>

      {images.length === 0 ? (
        <EmptyState
          icon={Images}
          title="Henüz portföy görseli eklemedin"
          description="Çalışmalarını gösteren fotoğraflar profilinde müşterilere güven verir."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {images.map((img, idx) => (
            <Card key={img.id} className="overflow-hidden py-0">
              <div className="relative aspect-square w-full bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.imageUrl}
                  alt={img.categoryName ?? "Portföy görseli"}
                  className="size-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <CardContent className="flex flex-col gap-2 py-3">
                {img.categoryName ? (
                  <Badge variant="outline" className="w-fit">
                    {img.categoryName}
                  </Badge>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ImageOff className="size-3" /> Kategorisiz
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      disabled={isPending || idx === 0}
                      onClick={() => handleMove(img.id, "up")}
                    >
                      <ArrowUp className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      disabled={isPending || idx === images.length - 1}
                      onClick={() => handleMove(img.id, "down")}
                    >
                      <ArrowDown className="size-3.5" />
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-sm"
                    disabled={isPending}
                    onClick={() => handleDelete(img.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
