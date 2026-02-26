import type { PortfolioSummary } from "../types";
import { formatGBP, formatPct, hasAnyValue } from "../utils";

type SummaryCardsProps = {
  summary: PortfolioSummary;
};

export function SummaryCards({ summary }: SummaryCardsProps) {
  const showData = hasAnyValue(summary);

  return (
    <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <div className="rounded-lg border border-border-subtle bg-card p-4">
        <p className="text-xs text-text-muted">Invested</p>
        <p className="mt-1 text-lg font-semibold">
          {showData ? formatGBP(summary.totalInvested) : "—"}
        </p>
      </div>

      <div className="rounded-lg border border-border-subtle bg-card p-4">
        <p className="text-xs text-text-muted">Value</p>
        <p className="mt-1 text-lg font-semibold">
          {showData ? formatGBP(summary.totalValue) : "—"}
        </p>
      </div>

      <div className="rounded-lg border border-border-subtle bg-card p-4">
        <p className="text-xs text-text-muted">Profit</p>
        <p className="mt-1 text-lg font-semibold">
          {showData ? formatGBP(summary.totalProfit) : "—"}
        </p>
      </div>

      <div className="rounded-lg border border-border-subtle bg-card p-4">
        <p className="text-xs text-text-muted">Profit %</p>
        <p className="mt-1 text-lg font-semibold">
          {showData ? `${formatPct(summary.profitPercentage)}%` : "—"}
        </p>
      </div>
    </section>
  );
}

