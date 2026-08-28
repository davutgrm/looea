"use client";

import { useEffect, useRef, useState, type ElementType } from "react";
import { cn } from "@/lib/utils";

/**
 * Görünür olunca bir kez aşağıdan fade+translate ile giren sarmalayıcı.
 * Animasyon globals.css'teki `[data-reveal]` kuralında; burada yalnızca
 * görünürlük ve `delay` yönetilir. prefers-reduced-motion CSS'te ele alınır.
 */
export function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  className,
  ...props
}: {
  children: React.ReactNode;
  as?: ElementType;
  delay?: number;
  className?: string;
} & React.HTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;
    if (typeof IntersectionObserver === "undefined") {
      // IO desteklenmiyorsa içeriği göster — senkron setState'ten kaçınmak için ertele.
      const raf = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(raf);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown]);

  return (
    <Tag
      ref={ref}
      data-reveal={shown ? "in" : "out"}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
      className={cn(className)}
      {...props}
    >
      {children}
    </Tag>
  );
}
