"use client";

import { useCallback, useMemo, useState } from "react";
import type { Holding } from "../types";
import {
  filterHoldings,
  getUniqueGrades,
  getUniqueSets,
  type FilterEntry,
  type QuickPreset,
} from "../utils";

export const PAGE_SIZE = 10;

export type PortfolioView = {
  search: string;
  filters: FilterEntry[];
  quickPreset: QuickPreset;
  page: number;

  availableGrades: string[];
  availableSets: string[];

  filteredHoldings: Holding[];
  paginatedHoldings: Holding[];

  onSearchChange: (value: string) => void;
  onRemoveFilter: (key: FilterEntry["key"], value: string) => void;
  onClearAll: () => void;
  onQuickPresetChange: (preset: QuickPreset) => void;
  onAddFilter: (key: FilterEntry["key"], value: string) => void;
  onPageChange: (page: number) => void;
};

export function usePortfolioView(holdings: Holding[]): PortfolioView {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterEntry[]>([]);
  const [quickPreset, setQuickPreset] = useState<QuickPreset>("all");
  const [page, setPage] = useState(1);

  const availableGrades = useMemo(
    () => getUniqueGrades(holdings),
    [holdings],
  );
  const availableSets = useMemo(
    () => getUniqueSets(holdings),
    [holdings],
  );

  const filteredHoldings = useMemo(
    () => filterHoldings(holdings, search, filters, quickPreset),
    [holdings, search, filters, quickPreset],
  );

  const paginatedHoldings = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredHoldings.slice(start, start + PAGE_SIZE);
  }, [filteredHoldings, page]);

  const onSearchChange = useCallback((value: string) => {
    setPage(1);
    setSearch(value);
  }, []);

  const onRemoveFilter = useCallback(
    (key: FilterEntry["key"], value: string) => {
      setPage(1);
      setFilters((prev) =>
        prev.filter((f) => !(f.key === key && f.value === value)),
      );
    },
    [],
  );

  const onClearAll = useCallback(() => {
    setPage(1);
    setFilters([]);
    setSearch("");
    setQuickPreset("all");
  }, []);

  const onQuickPresetChange = useCallback((preset: QuickPreset) => {
    setPage(1);
    setQuickPreset(preset);
  }, []);

  const onAddFilter = useCallback((key: FilterEntry["key"], value: string) => {
    setPage(1);
    setFilters((prev) =>
      prev.some((f) => f.key === key && f.value === value)
        ? prev
        : [...prev, { key, value }],
    );
  }, []);

  const onPageChange = useCallback((nextPage: number) => {
    setPage(nextPage);
  }, []);

  return {
    search,
    filters,
    quickPreset,
    page,
    availableGrades,
    availableSets,
    filteredHoldings,
    paginatedHoldings,
    onSearchChange,
    onRemoveFilter,
    onClearAll,
    onQuickPresetChange,
    onAddFilter,
    onPageChange,
  };
}

