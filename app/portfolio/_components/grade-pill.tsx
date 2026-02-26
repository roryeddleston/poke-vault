/**
 * Renders a grade badge with mock-aligned colors: PSA (accent), BGS (blue), Raw (neutral).
 */
type GradePillProps = {
  grade: string;
  className?: string;
};

export function GradePill({ grade, className = "" }: GradePillProps) {
  const normalized = grade.toUpperCase();
  const isPsa = normalized.includes("PSA");
  const isBgs = normalized.includes("BGS");

  const style = isPsa
    ? "bg-accent-muted/30 text-accent border-accent/20"
    : isBgs
      ? "bg-sky-500/10 text-sky-400 border-sky-400/20"
      : "bg-surface-soft text-text-muted border-border-subtle";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${style} ${className}`}
      aria-label={`Grade: ${grade}`}
    >
      {grade}
    </span>
  );
}
