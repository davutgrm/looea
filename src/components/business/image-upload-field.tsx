"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const MAX_CLIENT_BYTES = 5 * 1024 * 1024;

type UploadResult = { success: true; data: { url: string } } | { success: false; error: string };

export function ImageUploadField({
  label,
  value,
  onUploaded,
  upload,
  shape = "square",
}: {
  label: string;
  value: string | null;
  onUploaded: (url: string) => void;
  upload: (formData: FormData) => Promise<UploadResult>;
  shape?: "square" | "banner" | "circle";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value);
  const [isPending, startTransition] = useTransition();

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Lütfen bir resim dosyası seç");
      return;
    }
    if (file.size > MAX_CLIENT_BYTES) {
      toast.error("Görsel en fazla 5MB olabilir");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("file", file);
      const result = await upload(formData);
      URL.revokeObjectURL(objectUrl);
      if (result.success) {
        setPreview(result.data.url);
        onUploaded(result.data.url);
        toast.success("Görsel yüklendi");
      } else {
        setPreview(value);
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        className={cn(
          "group relative flex items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted transition-colors hover:border-app-accent disabled:pointer-events-none",
          shape === "circle" && "size-24 rounded-full",
          shape === "square" && "size-24",
          shape === "banner" && "aspect-[3/1] w-full",
        )}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- variable external/Storage URL, next/image adds no value here
          <img src={preview} alt={label} className="size-full object-cover" />
        ) : (
          <Upload className="size-6 text-muted-foreground transition-colors group-hover:text-app-accent" />
        )}
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <Loader2 className="size-5 animate-spin text-app-accent" />
          </div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
