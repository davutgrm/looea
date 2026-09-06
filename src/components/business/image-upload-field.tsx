"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, UploadCloud, X, RefreshCw } from "lucide-react";
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
  hint = "Sürükle bırak veya seç · JPG, PNG, WEBP · en fazla 5MB",
}: {
  label: string;
  value: string | null;
  onUploaded: (url: string) => void;
  upload: (formData: FormData) => Promise<UploadResult>;
  shape?: "square" | "banner" | "circle";
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Lütfen bir resim dosyası seç (JPG, PNG veya WEBP).");
      return;
    }
    if (file.size > MAX_CLIENT_BYTES) {
      setError("Görsel çok büyük — en fazla 5MB olabilir.");
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
        setError(result.error);
      }
    });
  }

  function remove() {
    setPreview(null);
    setError(null);
    onUploaded("");
    if (inputRef.current) inputRef.current.value = "";
  }

  const dropHandlers = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      if (!isPending) setDragging(true);
    },
    onDragLeave: (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (!isPending) handleFile(e.dataTransfer.files?.[0]);
    },
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-foreground">{label}</Label>
      <div
        className={cn(
          "group relative flex items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed bg-muted/60 transition-colors duration-200 ease-[var(--ease-out-quart)]",
          dragging ? "border-app-accent bg-app-accent-soft/60" : "border-border hover:border-app-accent/70",
          error && "border-destructive/60",
          shape === "circle" && "size-24 rounded-full",
          shape === "square" && "size-28",
          shape === "banner" && "aspect-[3/1] w-full",
        )}
        {...dropHandlers}
      >
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isPending}
          aria-label={preview ? `${label} — değiştir` : `${label} — görsel yükle`}
          className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent disabled:pointer-events-none"
        >
          {preview ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- external/Storage URL, next/image adds no value */}
              <img src={preview} alt={label} className="size-full object-cover" />
              {!isPending && (
                <span className="absolute inset-0 flex items-center justify-center gap-1.5 bg-foreground/45 text-xs font-semibold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <RefreshCw className="size-4" /> Değiştir
                </span>
              )}
            </>
          ) : (
            <>
              <UploadCloud
                className={cn(
                  "size-6 text-muted-foreground transition-colors",
                  dragging ? "text-app-accent" : "group-hover:text-app-accent",
                )}
              />
              {shape === "banner" && (
                <span className="px-4 text-xs font-medium text-muted-foreground">{hint}</span>
              )}
            </>
          )}
          {isPending && (
            <span className="absolute inset-0 flex items-center justify-center gap-2 bg-background/75 text-xs font-medium text-app-accent">
              <Loader2 className="size-5 animate-spin" /> Yükleniyor…
            </span>
          )}
        </button>
        {preview && !isPending && (
          <button
            type="button"
            onClick={remove}
            aria-label={`${label} — kaldır`}
            className="absolute top-1.5 right-1.5 z-10 flex size-7 items-center justify-center rounded-full bg-background/90 text-muted-foreground shadow-e1 transition-colors hover:text-destructive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      {shape !== "banner" && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
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
