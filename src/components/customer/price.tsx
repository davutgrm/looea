/** Space Grotesk's ₺ glyph renders malformed, so the symbol is pinned to the sans (Geist) stack. */
export function Price({ amount, className }: { amount: number; className?: string }) {
  return (
    <span className={className}>
      {amount}
      <span className="font-sans">₺</span>
    </span>
  );
}
