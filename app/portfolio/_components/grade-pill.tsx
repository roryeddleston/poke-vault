/**
 * Renders a grade badge with mock-aligned colors: PSA (accent), BGS (blue), Raw (neutral).
 */
type GradePillProps = {
  grade: string;
  className?: string;
};

export function GradePill({ grade, className = "" }: GradePillProps) {
  const style = "bg-surface text-text-main border-border-subtle";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${style} ${className}`}
      aria-label={`Grade: ${grade}`}
    >
      {grade}
    </span>
  );
}
