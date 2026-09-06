/** "veya" ayracı — auth ekranlarında form ile sosyal giriş butonu arasında. */
export function AuthDivider({ label = "veya" }: { label?: string }) {
  return (
    <div className="my-5 flex items-center gap-3" role="separator" aria-label={label}>
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
