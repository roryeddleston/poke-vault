"use client";

import { useCallback, useMemo, useState } from "react";
import type { Holding, PortfolioResponse } from "../types";
import {
  filterHoldings,
  getUniqueGrades,
  getUniqueSets,
  type FilterEntry,
} from "../utils";
import { PortfolioFilterBar } from "./filter-bar";
import { HoldingsTable } from "./holdings-table";
import { PortfolioHeader } from "./header";
import { SummaryCards } from "./summary-cards";

type PortfolioContentProps = {
  data: PortfolioResponse;
};

export function PortfolioContent({ data }: PortfolioContentProps) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterEntry[]>([]);

  const availableGrades = useMemo(
    () => getUniqueGrades(data.holdings),
    [data.holdings],
  );
  const availableSets = useMemo(
    () => getUniqueSets(data.holdings),
    [data.holdings],
  );

  const filteredHoldings = useMemo(
    () => filterHoldings(data.holdings, search, filters),
    [data.holdings, search, filters],
  );

  const onRemoveFilter = useCallback((key: FilterEntry["key"], value: string) => {
    setFilters((prev) => prev.filter((f) => !(f.key === key && f.value === value)));
  }, []);

  const onClearAll = useCallback(() => {
    setFilters([]);
    setSearch("");
  }, []);

  const onAddFilter = useCallback((key: FilterEntry["key"], value: string) => {
    setFilters((prev) =>
      prev.some((f) => f.key === key && f.value === value)
        ? prev
        : [...prev, { key, value }],
    );
  }, []);

  return (
    <>
      <PortfolioHeader summary={data.summary} />
      <SummaryCards summary={data.summary} />
      <PortfolioFilterBar
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        onRemoveFilter={onRemoveFilter}
        onClearAll={onClearAll}
        availableGrades={availableGrades}
        availableSets={availableSets}
        onAddFilter={onAddFilter}
      />
      <HoldingsTable holdings={filteredHoldings} />
    </>
  );
}
