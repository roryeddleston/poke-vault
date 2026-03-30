"use client";

import type { FilterEntry } from "../utils";

type FiltersDropdownProps = {
  availableGrades: string[];
  availableSets: string[];
  onAddFilter: (key: FilterEntry["key"], value: string) => void;
  onClose: () => void;
};

export function FiltersDropdown({
  availableGrades,
  availableSets,
  onAddFilter,
  onClose,
}: FiltersDropdownProps) {
  return (
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
                onClose();
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
                onClose();
              }}
              className="block w-full cursor-pointer rounded-lg px-2 py-1.5 text-left text-sm text-text-main transition-colors hover:bg-surface-soft"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

