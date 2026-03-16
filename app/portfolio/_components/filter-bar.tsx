"use client";

import { useEffect, useRef, useState } from "react";
import { SearchIcon } from "@/components/icons";
import type { FilterEntry, QuickPreset } from "../utils";

type PortfolioFilterBarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  filters: FilterEntry[];
  quickPreset: QuickPreset;
  onQuickPresetChange: (preset: QuickPreset) => void;
  onRemoveFilter: (key: FilterEntry["key"], value: string) => void;
  onClearAll: () => void;
  availableGrades: string[];
  availableSets: string[];
  onAddFilter: (key: FilterEntry["key"], value: string) => void;
  onExport: () => void;
};

export function PortfolioFilterBar({
  search,
  onSearchChange,
  filters,
  quickPreset,
  onQuickPresetChange,
  onRemoveFilter,
  onClearAll,
  availableGrades,
  availableSets,
  onAddFilter,
  onExport,
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
      className="space-y-3 rounded-2xl border border-border-subtle bg-card px-3 py-3 shadow-sm sm:px-4 sm:py-4"
    >
      <div className="flex items-center gap-5 overflow-x-auto border-b border-border-subtle/70 pb-2 text-sm">
        <QuickPresetButton
          active={quickPreset === "all"}
          label="All Collections"
          onClick={() => onQuickPresetChange("all")}
        />
        <QuickPresetButton
          active={quickPreset === "graded"}
          label="Graded"
          onClick={() => onQuickPresetChange("graded")}
        />
        <QuickPresetButton
          active={quickPreset === "raw"}
          label="RAW Only"
          onClick={() => onQuickPresetChange("raw")}
        />
        <QuickPresetButton
          active={quickPreset === "recent"}
          label="Recently Added"
          onClick={() => onQuickPresetChange("recent")}
        />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-border-subtle bg-surface px-3 py-2 text-sm text-text-muted">
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
              className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border-subtle bg-surface px-3 py-1.5 text-xs font-medium text-text-main shadow-sm transition-colors hover:border-accent-soft hover:bg-surface-soft"
            >
              Filters
            </button>
            {filtersOpen && (
              <div
                role="listbox"
                aria-label="Add filter"
                className="absolute right-0 top-full z-10 mt-1 w-52 rounded-xl border border-border-subtle bg-card py-1 shadow-xl"
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
                        aria-selected="false"
                        onClick={() => {
                          onAddFilter("grade", g);
                          setFiltersOpen(false);
                        }}
                        className="block w-full cursor-pointer rounded-lg px-2 py-1.5 text-left text-sm text-text-main transition-colors hover:bg-surface-soft"
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
                        aria-selected="false"
                        onClick={() => {
                          onAddFilter("set", s);
                          setFiltersOpen(false);
                        }}
                        className="block w-full cursor-pointer rounded-lg px-2 py-1.5 text-left text-sm text-text-main transition-colors hover:bg-surface-soft"
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
            onClick={onExport}
            className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border-subtle bg-surface px-3 py-1.5 text-xs font-medium text-text-main shadow-sm transition-colors hover:border-accent-soft hover:bg-surface-soft"
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

        {quickPreset === "all" && filters.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="ml-auto cursor-pointer rounded-full border border-transparent px-2 py-1 text-xs font-medium text-text-muted transition-colors hover:border-border-subtle hover:bg-surface-soft hover:text-text-main"
          >
            Clear all
          </button>
        )}
      </div>
    </section>
  );
}

type QuickPresetButtonProps = {
  active: boolean;
  label: string;
  onClick: () => void;
};

function QuickPresetButton({ active, label, onClick }: QuickPresetButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 cursor-pointer rounded-t-md border-b-2 px-1 pb-2 text-sm font-semibold leading-5 transition-colors ${
        active
          ? "border-accent text-accent hover:text-accent-soft"
          : "border-transparent text-text-muted hover:text-text-main"
      }`}
    >
      {label}
    </button>
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
