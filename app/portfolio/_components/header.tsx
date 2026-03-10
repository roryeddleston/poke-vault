import type { PortfolioSummary } from "../types";
import { formatGBP, formatPct } from "../utils";

type PortfolioHeaderProps = {
  summary: PortfolioSummary;
  onAddCard?: () => void;
  onSetAsDefault?: () => void;
  setAsDefaultLoading?: boolean;
};

export function PortfolioHeader({
  summary,
  onAddCard,
  onSetAsDefault,
  setAsDefaultLoading,
}: PortfolioHeaderProps) {
  const hasValue = summary.totalValue > 0;

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-text-muted">
          Overview
        </p>
        <h1 className="text-2xl font-semibold sm:text-3xl">Portfolio</h1>
        <p className="text-sm text-text-muted">
          Net value across your graded Pokémon card collection.
        </p>
      </div>

      <div className="flex flex-col items-end gap-3 sm:items-start">
        <div className="space-y-2 text-right sm:text-left">
          <p className="text-xs uppercase tracking-[0.14em] text-text-muted">
            Total value
          </p>
          <div className="flex items-baseline justify-end gap-3 sm:justify-start">
            <p className="text-2xl font-semibold sm:text-3xl">
              {hasValue ? formatGBP(summary.totalValue) : "—"}
            </p>
            <span
              className="inline-flex items-center gap-1 rounded-full bg-accent-muted/20 px-2 py-0.5 text-xs font-medium text-accent"
              aria-label={`Profit ${summary.profitPercentage.toFixed(2)} percent`}
            >
              <span>↑</span>
              <span>{formatPct(summary.profitPercentage)}%</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onSetAsDefault ? (
            <button
              type="button"
              onClick={onSetAsDefault}
              disabled={setAsDefaultLoading}
              className="inline-flex items-center justify-center rounded-full border border-border-subtle bg-surface px-4 py-2 text-xs font-medium text-text-main shadow-sm transition-colors hover:border-accent-soft hover:bg-surface-soft cursor-pointer disabled:opacity-60"
            >
              {setAsDefaultLoading ? "Saving…" : "Set as default"}
            </button>
          ) : null}
          {onAddCard ? (
            <button
              type="button"
              onClick={onAddCard}
              className="inline-flex items-center justify-center rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-accent-soft cursor-pointer"
            >
              + Add Card
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
