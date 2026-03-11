import type { PortfolioSummary } from "../types";

type PortfolioHeaderProps = {
  summary: PortfolioSummary;
  onAddCard?: () => void;
  onSetAsDefault?: () => void;
  setAsDefaultLoading?: boolean;
};

export function PortfolioHeader({
  onAddCard,
  onSetAsDefault,
  setAsDefaultLoading,
}: PortfolioHeaderProps) {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">My Collection</h1>
        <p className="text-sm text-text-muted">
          Net value across your Pokémon collection.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {onSetAsDefault ? (
          <button
            type="button"
            onClick={onSetAsDefault}
            disabled={setAsDefaultLoading}
            className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-border-subtle bg-card px-4 py-2 text-xs font-semibold text-text-main shadow-sm transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
          >
            {setAsDefaultLoading ? "Saving…" : "Set as default"}
          </button>
        ) : null}
        {onAddCard ? (
          <button
            type="button"
            onClick={onAddCard}
            className="inline-flex cursor-pointer items-center justify-center gap-1 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-accent-soft"
          >
            <span className="text-base leading-none" aria-hidden="true">
              +
            </span>
            <span>Add card</span>
          </button>
        ) : null}
      </div>
    </header>
  );
}
