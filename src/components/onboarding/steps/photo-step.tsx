"use client";

import { useRef } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";

const MAX_FILE_SIZE = 3 * 1024 * 1024;

export function PhotoStep({ value, onChange }: { value: string | null; onChange: (value: string | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Lütfen bir resim dosyası seç");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Görsel en fazla 3MB olabilir");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="group flex size-32 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-border bg-muted transition-colors hover:border-app-accent"
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element -- client-only data URL preview, next/image adds no value here
            <img src={value} alt="Profil fotoğrafı" className="size-full object-cover" />
          ) : (
            <Camera className="size-8 text-muted-foreground transition-colors group-hover:text-app-accent" />
          )}
        </button>
        {value && (
          <span className="absolute right-0 bottom-0 flex size-9 items-center justify-center rounded-full bg-app-accent text-app-accent-foreground shadow-md ring-2 ring-background">
            <Camera className="size-4" />
          </span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
