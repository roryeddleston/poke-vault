"use client";

import { useEffect, useRef, useState } from "react";
import type { FilterEntry, QuickPreset } from "../utils";
import { QuickPresetTabs } from "./quick-preset-tabs";
import { PortfolioSearchInput } from "./portfolio-search-input";
import { FiltersDropdown } from "./filters-dropdown";
import { FilterChipsRow } from "./filter-chips-row";
import { FiDownload, FiSliders } from "react-icons/fi";

type PortfolioFilterBarProps = {
  view: {
    search: string;
    filters: FilterEntry[];
    quickPreset: QuickPreset;
    availableGrades: string[];
    availableSets: string[];
    canExport: boolean;
  };
  actions: {
    onSearchChange: (value: string) => void;
    onQuickPresetChange: (preset: QuickPreset) => void;
    onRemoveFilter: (key: FilterEntry["key"], value: string) => void;
    onClearAll: () => void;
    onAddFilter: (key: FilterEntry["key"], value: string) => void;
    onExport: () => void;
  };
};

export function PortfolioFilterBar({
  view,
  actions,
}: PortfolioFilterBarProps) {
  const {
    search,
    filters,
    quickPreset,
    availableGrades,
    availableSets,
    canExport,
  } = view;

  const {
    onSearchChange,
    onQuickPresetChange,
    onRemoveFilter,
    onClearAll,
    onAddFilter,
    onExport,
  } = actions;

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
      className="shadow-elevation-2 space-y-3 rounded-2xl border border-border-subtle bg-card px-3 py-3 sm:px-4 sm:py-4"
    >
      <div className="flex items-center gap-5 overflow-x-auto border-b border-border-subtle/70 pb-2.5 text-sm">
        <QuickPresetTabs active={quickPreset} onChange={onQuickPresetChange} />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <PortfolioSearchInput value={search} onChange={onSearchChange} />

        <div className="relative flex w-full items-center justify-end gap-2 self-end sm:w-auto sm:self-auto">
          <div ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setFiltersOpen((o) => !o)}
              aria-expanded={filtersOpen}
              aria-haspopup="listbox"
              aria-label="Open filters menu"
              className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm transition-colors ${
                filtersOpen
                  ? "border-accent/60 bg-accent-muted/20 text-text-main"
                  : "border-border-subtle bg-surface text-text-main hover:border-accent-soft hover:bg-surface-soft"
              }`}
            >
              <FiSliders className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              Filters
            </button>
            {filtersOpen && (
                <FiltersDropdown
                  availableGrades={availableGrades}
                  availableSets={availableSets}
                  onAddFilter={onAddFilter}
                  onClose={() => setFiltersOpen(false)}
                />
            )}
          </div>
          <button
            type="button"
            aria-label="Export CSV"
            onClick={onExport}
            disabled={!canExport}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-accent/25 bg-accent-muted/20 px-3 py-1.5 text-xs font-medium text-accent shadow-sm transition-colors hover:border-accent/40 hover:bg-accent-muted/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-accent/25 disabled:hover:bg-accent-muted/20"
          >
            <FiDownload className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
            Export CSV
          </button>
        </div>
      </div>

      <FilterChipsRow
        filters={filters}
        quickPreset={quickPreset}
        onRemoveFilter={onRemoveFilter}
        onClearAll={onClearAll}
      />
    </section>
  );
}
