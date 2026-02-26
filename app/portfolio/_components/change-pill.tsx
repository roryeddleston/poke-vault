import { formatPct } from "../utils";

type ChangePillProps = {
  /** Percentage change; null shows "—" when no data. */
  value: number | null;
  className?: string;
};

export function ChangePill({ value, className = "" }: ChangePillProps) {
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
    ? "text-accent"
    : isNegative
      ? "text-danger"
      : "text-text-muted";

  const arrow = isPositive ? "▲" : isNegative ? "▼" : "−";
  const label = isPositive
    ? `Up ${formatPct(value)}%`
    : isNegative
      ? `Down ${formatPct(-value)}%`
      : "No change";

  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${color} ${className}`}
      aria-label={label}
    >
      <span aria-hidden="true">{arrow}</span>
      <span>{formatPct(Math.abs(value))}%</span>
    </span>
  );
}
