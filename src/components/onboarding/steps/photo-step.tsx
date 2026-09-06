"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadAvatar } from "@/lib/actions/customer";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function PhotoStep({ value, onChange }: { value: string | null; onChange: (value: string | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value);
  const [isPending, startTransition] = useTransition();

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Lütfen bir resim dosyası seç");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Görsel en fazla 5MB olabilir");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadAvatar(formData);
      URL.revokeObjectURL(objectUrl);
      if (result.success) {
        setPreview(result.data.url);
        onChange(result.data.url);
      } else {
        setPreview(value);
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isPending}
          className="group relative flex size-32 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-border bg-muted transition-colors hover:border-app-accent disabled:pointer-events-none"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- client-only preview / Storage URL, next/image adds no value here
            <img src={preview} alt="Profil fotoğrafı" className="size-full object-cover" />
          ) : (
            <Camera className="size-8 text-muted-foreground transition-colors group-hover:text-app-accent" />
          )}
          {isPending && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70">
              <Loader2 className="size-6 animate-spin text-app-accent" />
            </div>
          )}
        </button>
        {preview && !isPending && (
          <span className="absolute right-0 bottom-0 flex size-9 items-center justify-center rounded-full bg-app-accent text-app-accent-foreground shadow-md ring-2 ring-background">
            <Camera className="size-4" />
          </span>
        )}
      </div>
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
