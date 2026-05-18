import { formatPct } from "../utils";

type ChangePillProps = {
  /** Percentage change; null shows "—" when no data. */
  value: number | null;
  /** Optional period for aria-label, e.g. "this month". */
  periodLabel?: string;
  className?: string;
};

export function ChangePill({
  value,
  periodLabel,
  className = "",
}: ChangePillProps) {
  if (value === null) {
    return (
      <span className={`text-xs text-text-muted ${className}`} aria-hidden="true">
        —
      </span>
    );
  }

  const isPositive = value > 0;
  const isNegative = value < 0;
  const color = isPositive
    ? "text-text-positive"
    : isNegative
      ? "text-danger"
      : "text-text-muted";

  const arrow = isPositive ? "▲" : isNegative ? "▼" : "−";
  const baseLabel = isPositive
    ? `Up ${formatPct(value)}%`
    : isNegative
      ? `Down ${formatPct(-value)}%`
      : "No change";
  const label = periodLabel ? `${baseLabel} ${periodLabel}` : baseLabel;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-xs font-semibold ${color} ${className}`}
      aria-label={label}
    >
      <span aria-hidden="true">{arrow}</span>
      <span>{formatPct(Math.abs(value))}%</span>
    </span>
  );
}
