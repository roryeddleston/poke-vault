"use client";

import { useEffect, useRef, useState } from "react";
import { SearchIcon } from "@/components/icons";
import type { FilterEntry } from "../utils";

type PortfolioFilterBarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  filters: FilterEntry[];
  onRemoveFilter: (key: FilterEntry["key"], value: string) => void;
  onClearAll: () => void;
  availableGrades: string[];
  availableSets: string[];
  onAddFilter: (key: FilterEntry["key"], value: string) => void;
};

export function PortfolioFilterBar({
  search,
  onSearchChange,
  filters,
  onRemoveFilter,
  onClearAll,
  availableGrades,
  availableSets,
  onAddFilter,
}: PortfolioFilterBarProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filtersOpen) return;
    const handle = (e: MouseEvent) => {
      if (dropdownRef.current?.contains(e.target as Node)) return;
      setFiltersOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [filtersOpen]);

  return (
    <section
      aria-label="Portfolio filters"
      className="space-y-3 rounded-xl border border-border-subtle bg-card px-3 py-3 sm:px-4 sm:py-4"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-full bg-surface-soft px-3 py-2 text-sm text-text-muted">
          <SearchIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <input
            type="search"
            aria-label="Search portfolio cards"
            placeholder="Search by name, number or set..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full min-w-0 bg-transparent text-sm text-text-main placeholder:text-text-muted focus:outline-none"
          />
        </div>

        <div className="relative flex items-center gap-2 self-end sm:self-auto">
          <div ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setFiltersOpen((o) => !o)}
              aria-expanded={filtersOpen}
              aria-haspopup="listbox"
              aria-label="Open filters menu"
              className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-surface px-3 py-1.5 text-xs font-medium text-text-main shadow-sm transition-colors hover:bg-surface-soft"
            >
              Filters
            </button>
            {filtersOpen && (
              <div
                role="listbox"
                aria-label="Add filter"
                className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border border-border-subtle bg-card py-1 shadow-lg"
              >
                {availableGrades.length > 0 && (
                  <div className="px-2 py-1">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
                      Grade
                    </p>
                    {availableGrades.map((g) => (
                      <button
                        key={g}
                        type="button"
                        role="option"
                        onClick={() => {
                          onAddFilter("grade", g);
                          setFiltersOpen(false);
                        }}
                        className="block w-full rounded px-2 py-1.5 text-left text-sm text-text-main hover:bg-surface-soft"
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                )}
                {availableSets.length > 0 && (
                  <div className="border-t border-border-subtle px-2 py-1">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
                      Set
                    </p>
                    {availableSets.map((s) => (
                      <button
                        key={s}
                        type="button"
                        role="option"
                        onClick={() => {
                          onAddFilter("set", s);
                          setFiltersOpen(false);
                        }}
                        className="block w-full rounded px-2 py-1.5 text-left text-sm text-text-main hover:bg-surface-soft"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <button
            type="button"
            aria-label="Export portfolio"
            className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-surface px-3 py-1.5 text-xs font-medium text-text-main shadow-sm transition-colors hover:bg-surface-soft"
          >
            Export
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        {filters.map((f) => (
          <FilterChip
            key={`${f.key}-${f.value}`}
            label={f.key === "grade" ? "Grade" : "Set"}
            value={f.value}
            onRemove={() => onRemoveFilter(f.key, f.value)}
          />
        ))}

        {filters.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="ml-auto text-xs font-medium text-text-muted transition-colors hover:text-text-main"
          >
            Clear all
          </button>
        )}
      </div>
    </section>
  );
}

type FilterChipProps = {
  label: string;
  value: string;
  onRemove: () => void;
};

function FilterChip({ label, value, onRemove }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-surface-soft px-3 py-1 text-xs text-text-main ring-1 ring-border-subtle transition-colors hover:bg-surface"
      aria-label={`Remove ${label} filter: ${value}`}
    >
      <span className="font-medium text-text-muted">{label}:</span>
      <span className="rounded-full bg-page px-2 py-0.5 text-[11px] font-medium">
        {value}
      </span>
      <span aria-hidden="true" className="text-sm leading-none text-text-muted">
        ×
      </span>
    </button>
  );
}
