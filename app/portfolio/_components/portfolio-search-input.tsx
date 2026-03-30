"use client";

import { SearchIcon } from "@/components/icons";

type PortfolioSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function PortfolioSearchInput({
  value,
  onChange,
}: PortfolioSearchInputProps) {
  return (
    <div className="flex flex-1 items-center gap-2 rounded-lg border border-border-subtle bg-card px-3 py-2 text-sm text-text-muted shadow-sm">
      <SearchIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <input
        type="search"
        aria-label="Search portfolio cards"
        placeholder="Search by name, number or set..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-w-0 bg-transparent text-sm text-text-main placeholder:text-text-muted focus:outline-none"
      />
    </div>
  );
}

