import Link from "next/link";
import { spaceGrotesk } from "@/lib/fonts";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className={`${spaceGrotesk.variable} flex min-h-dvh items-center justify-center bg-background px-6 py-16`}>
      <div className="w-full max-w-md">
        <Link href="/" className="font-grotesk inline-flex items-center gap-1.5 text-xl font-bold tracking-tight">
          Kuafi
          <span className="size-1.5 rounded-full bg-app-accent" />
        </Link>
        <h1 className="font-grotesk mt-10 text-3xl font-bold tracking-tight text-balance">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
        <div className="mt-8">{children}</div>
        {footer && <div className="mt-7 text-sm text-muted-foreground">{footer}</div>}
      </div>
    </div>
  );
}
