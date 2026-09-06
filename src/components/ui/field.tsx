import * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

/**
 * Field — paylaşılan form alanı sarmalayıcısı (Looea tasarım sistemi).
 * Üstte etiket → kontrol → (hata VEYA yardım metni). Erişilebilir: label `htmlFor`
 * ile bağlanır, hata `aria-describedby`/`role="alert"` ile duyurulur.
 *
 * Kullanım:
 *   <Field htmlFor="email" label="Email" error={errors.email}>
 *     <Input id="email" aria-invalid={!!errors.email} ... />
 *   </Field>
 *
 * Kontrol yüksekliği paylaşılan Input/Textarea/SelectTrigger primitiflerinden gelir
 * (≥44px). Odak halkası da primitiflerde tanımlı (`ring-ring`), burada tekrar edilmez.
 */
function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  className,
  labelClassName,
  children,
}: {
  label?: React.ReactNode;
  htmlFor?: string;
  error?: string | null;
  hint?: React.ReactNode;
  required?: boolean;
  className?: string;
  labelClassName?: string;
  children: React.ReactNode;
}) {
  const describedBy = htmlFor
    ? error
      ? `${htmlFor}-error`
      : hint
        ? `${htmlFor}-hint`
        : undefined
    : undefined;

  return (
    <div className={cn("space-y-1.5", className)} data-slot="field">
      {label != null && (
        <Label htmlFor={htmlFor} className={cn("text-foreground", labelClassName)}>
          {label}
          {required && (
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          )}
        </Label>
      )}
      {/* aria-describedby'ı ilgili kontrole yaymak çağıranın sorumluluğu değil:
          çoğu kontrol tek çocuk olduğundan describedBy'ı context yerine örnekte
          elle geçmek yeterli; burada yalnızca id'li mesaj düğümlerini sağlıyoruz. */}
      {children}
      {error ? (
        <p
          id={describedBy}
          role="alert"
          className="text-xs font-medium text-destructive"
        >
          {error}
        </p>
      ) : hint ? (
        <p id={describedBy} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export { Field };
