import { SearchIcon } from "@/components/icons";

export function PortfolioFilterBar() {
  return (
    <section
      aria-label="Portfolio filters"
      className="space-y-3 rounded-xl border border-border-subtle bg-card px-3 py-3 sm:px-4 sm:py-4"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-full bg-surface-soft px-3 py-2 text-sm text-text-muted">
          <SearchIcon className="h-4 w-4" aria-hidden="true" />
          <input
            type="search"
            aria-label="Search portfolio cards"
            placeholder="Search by name, set, or ID…"
            className="w-full bg-transparent text-sm text-text-main placeholder:text-text-muted focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-surface px-3 py-1.5 text-xs font-medium text-text-main shadow-sm transition-colors hover:bg-surface-soft"
          >
            Filters
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-surface px-3 py-1.5 text-xs font-medium text-text-main shadow-sm transition-colors hover:bg-surface-soft"
          >
            Export
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <FilterChip label="Grade" value="PSA 10" />
        <FilterChip label="Set" value="Base Set" />
        <FilterChip label="Type" value="Fire" />

        <button
          type="button"
          className="ml-auto text-xs font-medium text-text-muted transition-colors hover:text-text-main"
        >
          Clear all
        </button>
      </div>
    </section>
  );
}

type FilterChipProps = {
  label: string;
  value: string;
};

function FilterChip({ label, value }: FilterChipProps) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-full bg-surface-soft px-3 py-1 text-xs text-text-main ring-1 ring-border-subtle transition-colors hover:bg-surface"
      aria-label={`${label} filter: ${value}`}
    >
      <span className="font-medium text-text-muted">{label}:</span>
      <span className="rounded-full bg-page px-2 py-0.5 text-[11px] font-medium">
        {value}
      </span>
      <span
        aria-hidden="true"
        className="text-sm leading-none text-text-muted"
      >
        ×
      </span>
    </button>
  );
}

