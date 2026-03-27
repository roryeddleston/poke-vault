import type { PortfolioSummary } from "../types";
import { formatGBP, formatPct, hasAnyValue } from "../utils";
import { FiDollarSign, FiGrid, FiTrendingUp } from "react-icons/fi";
import { SurfaceCard } from "@/components/SurfaceCard";

type SummaryCardsProps = {
  summary: PortfolioSummary;
  totalCards: number;
};

export function SummaryCards({ summary, totalCards }: SummaryCardsProps) {
  const showData = hasAnyValue(summary);
  const profitPositive = summary.totalProfit >= 0;

  return (
    <section className="grid grid-cols-1 gap-3 lg:grid-cols-3">
      <SurfaceCard as="div" className="relative min-h-36 p-5">
        <span className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle bg-surface text-emerald-600 dark:text-emerald-300">
          <FiDollarSign size={16} aria-hidden="true" />
        </span>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
          Total net value
        </p>
        <p className="mt-3 text-3xl font-semibold tracking-tight">
          {showData ? formatGBP(summary.totalValue) : "—"}
        </p>
      </SurfaceCard>

      <SurfaceCard as="div" className="relative min-h-36 p-5">
        <span className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle bg-surface text-sky-600 dark:text-sky-300">
          <FiTrendingUp size={16} aria-hidden="true" />
        </span>
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
      </SurfaceCard>

      <SurfaceCard as="div" className="relative min-h-36 p-5">
        <span className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle bg-surface text-orange-600 dark:text-orange-300">
          <FiGrid size={16} aria-hidden="true" />
        </span>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
          Cards in portfolio
        </p>
        <p className="mt-3 text-3xl font-semibold tracking-tight">
          {totalCards}
        </p>
      </SurfaceCard>
    </section>
  );
}

