"use client";

import { ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { spaceGrotesk } from "@/lib/fonts";

export function OnboardingShell({
  step,
  totalSteps,
  title,
  subtitle,
  onBack,
  canContinue,
  onContinue,
  continuePending,
  skipLabel,
  onSkip,
  children,
}: {
  step: number;
  totalSteps: number;
  title: string;
  subtitle: string;
  onBack?: () => void;
  canContinue: boolean;
  onContinue: () => void;
  continuePending?: boolean;
  skipLabel?: string;
  onSkip?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className={`${spaceGrotesk.variable} flex min-h-dvh flex-col bg-background`}>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-8 sm:py-12">
        <div className="flex items-center gap-3">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              aria-label="Geri"
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft className="size-5" />
            </button>
          ) : (
            <div className="size-9 shrink-0" />
          )}
          <span className="text-sm font-medium text-muted-foreground">
            Adım {step}/{totalSteps}
          </span>
        </div>

        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-app-accent transition-all"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        <div className="flex flex-1 flex-col justify-center py-10">
          <h1 className="font-grotesk text-2xl font-bold tracking-tight text-balance sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>

        <div className="flex flex-col items-center gap-3 pb-4">
          <Button
            variant="accent"
            size="lg"
            className="w-full"
            disabled={!canContinue || continuePending}
            onClick={onContinue}
          >
            {continuePending && <Loader2 className="size-4 animate-spin" />}
            Devam
          </Button>
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {skipLabel ?? "Bu adımı atla"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
