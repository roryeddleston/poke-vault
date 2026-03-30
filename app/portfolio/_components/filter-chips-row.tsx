"use client";

import type { FilterEntry, QuickPreset } from "../utils";

type FilterChipsRowProps = {
  filters: FilterEntry[];
  quickPreset: QuickPreset;
  onRemoveFilter: (key: FilterEntry["key"], value: string) => void;
  onClearAll: () => void;
};

export function FilterChipsRow({
  filters,
  quickPreset,
  onRemoveFilter,
  onClearAll,
}: FilterChipsRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {filters.map((f) => (
        <FilterChip
          key={`${f.key}-${f.value}`}
          label={f.key === "grade" ? "Grade" : "Set"}
          value={f.value}
          onRemove={() => onRemoveFilter(f.key, f.value)}
        />
      ))}

      {quickPreset === "all" && filters.length > 0 ? (
        <button
          type="button"
          onClick={onClearAll}
          className="ml-auto cursor-pointer rounded-full border border-transparent px-2 py-1 text-xs font-medium text-text-muted transition-colors hover:border-border-subtle hover:bg-surface-soft hover:text-text-main"
        >
          Clear all
        </button>
      ) : null}
    </div>
  );
}

function FilterChip({
  label,
  value,
  onRemove,
}: {
  label: string;
  value: string;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border-subtle bg-surface px-3 py-1 text-xs text-text-main transition-colors hover:bg-surface-soft"
      aria-label={`Remove ${label} filter: ${value}`}
    >
      <span className="font-medium text-text-muted">{label}:</span>
      <span className="rounded-full bg-surface-soft px-2 py-0.5 text-[11px] font-medium">
        {value}
      </span>
      <span
        aria-hidden="true"
        className="inline-flex h-4 w-4 items-center justify-center text-2xl leading-none font-semibold text-text-muted"
      >
        ×
      </span>
    </button>
  );
}

