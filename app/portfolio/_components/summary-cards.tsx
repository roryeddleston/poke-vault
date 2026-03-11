import type { PortfolioSummary } from "../types";
import { formatGBP, formatPct, hasAnyValue } from "../utils";

type SummaryCardsProps = {
  summary: PortfolioSummary;
  totalCards: number;
};

export function SummaryCards({ summary, totalCards }: SummaryCardsProps) {
  const showData = hasAnyValue(summary);
  const profitPositive = summary.totalProfit >= 0;

  return (
    <section className="grid grid-cols-1 gap-3 lg:grid-cols-3">
      <div className="rounded-2xl border border-border-subtle bg-card p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
          Total net value
        </p>
        <p className="mt-3 text-3xl font-semibold tracking-tight">
          {showData ? formatGBP(summary.totalValue) : "—"}
        </p>
      </div>

      <div className="rounded-2xl border border-border-subtle bg-card p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
          Overall gain / loss
        </p>
        <p className={`mt-3 text-3xl font-semibold tracking-tight ${profitPositive ? "text-emerald-600" : "text-danger"}`}>
          {showData ? formatGBP(summary.totalProfit) : "—"}
        </p>
        <p
          className={`mt-1 text-sm font-semibold ${
            profitPositive ? "text-emerald-600" : "text-danger"
          }`}
        >
          {showData ? `${profitPositive ? "+" : ""}${formatPct(summary.profitPercentage)}%` : "—"}
        </p>
      </div>

      <div className="rounded-2xl border border-border-subtle bg-card p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
          Cards in portfolio
        </p>
        <p className="mt-3 text-3xl font-semibold tracking-tight">
          {totalCards}
        </p>
      </div>
    </section>
  );
}

