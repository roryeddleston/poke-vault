"use client";

import { useCallback, useMemo, useState } from "react";
import type { PortfolioResponse } from "../types";
import {
  filterHoldings,
  getUniqueGrades,
  getUniqueSets,
  type FilterEntry,
} from "../utils";
import { PortfolioFilterBar } from "./filter-bar";
import { HoldingsTable } from "./holdings-table";
import { Pagination } from "./pagination";
import { PortfolioHeader } from "./header";
import { SummaryCards } from "./summary-cards";
import { AddHoldingDialog } from "./add-holding-dialog";

const PAGE_SIZE = 10;

type PortfolioContentProps = {
  data: PortfolioResponse;
};

export function PortfolioContent({ data }: PortfolioContentProps) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterEntry[]>([]);
  const [page, setPage] = useState(1);
  const [showAddDialog, setShowAddDialog] = useState(false);

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

  const paginatedHoldings = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredHoldings.slice(start, start + PAGE_SIZE);
  }, [filteredHoldings, page]);

  const handleSearchChange = useCallback((value: string) => {
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
  }, []);

  const onAddFilter = useCallback((key: FilterEntry["key"], value: string) => {
    setPage(1);
    setFilters((prev) =>
      prev.some((f) => f.key === key && f.value === value)
        ? prev
        : [...prev, { key, value }],
    );
  }, []);

  const handleExport = useCallback(() => {
    if (filteredHoldings.length === 0) return;

    const header = [
      "Card ID",
      "Name",
      "Set",
      "Grade",
      "Quantity",
      "Purchase price",
    ];

    const rows = filteredHoldings.map((h) => [
      h.cardId,
      h.cardName,
      h.setName,
      h.grade,
      String(h.quantity),
      String(h.purchasePrice),
    ]);

    const csv = [header, ...rows]
      .map((cols) =>
        cols
          .map((c) => {
            const value = c.replace(/"/g, '""');
            return `"${value}"`;
          })
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    link.download = `portfolio-export-${timestamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filteredHoldings]);

  return (
    <>
      <PortfolioHeader
        summary={data.summary}
        onAddCard={() => setShowAddDialog(true)}
      />
      <SummaryCards summary={data.summary} />
      <PortfolioFilterBar
        search={search}
        onSearchChange={handleSearchChange}
        filters={filters}
        onRemoveFilter={onRemoveFilter}
        onClearAll={onClearAll}
        availableGrades={availableGrades}
        availableSets={availableSets}
        onAddFilter={onAddFilter}
        onExport={handleExport}
      />
      <HoldingsTable
        holdings={paginatedHoldings}
        totalCount={filteredHoldings.length}
      />
      <Pagination
        totalItems={filteredHoldings.length}
        pageSize={PAGE_SIZE}
        currentPage={page}
        onPageChange={setPage}
      />
      <AddHoldingDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
      />
    </>
  );
}
