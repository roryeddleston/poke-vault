"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { PortfolioResponse } from "../types";
import {
  filterHoldings,
  getUniqueGrades,
  getUniqueSets,
  type FilterEntry,
  type QuickPreset,
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
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterEntry[]>([]);
  const [quickPreset, setQuickPreset] = useState<QuickPreset>("all");
  const [page, setPage] = useState(1);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showSetDefaultConfirm, setShowSetDefaultConfirm] = useState(false);
  const [setAsDefaultLoading, setSetAsDefaultLoading] = useState(false);

  const availableGrades = useMemo(
    () => getUniqueGrades(data.holdings),
    [data.holdings],
  );
  const availableSets = useMemo(
    () => getUniqueSets(data.holdings),
    [data.holdings],
  );

  const filteredHoldings = useMemo(
    () => filterHoldings(data.holdings, search, filters, quickPreset),
    [data.holdings, search, filters, quickPreset],
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

  const handleSetAsDefault = useCallback(async () => {
    setSetAsDefaultLoading(true);
    try {
      const res = await fetch("/api/portfolio/promote", { method: "POST" });
      if (!res.ok) throw new Error("Promote failed");
      router.refresh();
    } finally {
      setSetAsDefaultLoading(false);
      setShowSetDefaultConfirm(false);
    }
  }, [router]);

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
        onSetAsDefault={() => setShowSetDefaultConfirm(true)}
        setAsDefaultLoading={setAsDefaultLoading}
      />
      <SummaryCards summary={data.summary} totalCards={data.holdings.length} />
      <PortfolioFilterBar
        search={search}
        onSearchChange={handleSearchChange}
        filters={filters}
        quickPreset={quickPreset}
        onQuickPresetChange={onQuickPresetChange}
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
      {showSetDefaultConfirm ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="set-default-title"
          onClick={() => !setAsDefaultLoading && setShowSetDefaultConfirm(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border-subtle bg-card p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <h2 id="set-default-title" className="text-lg font-semibold text-text-main">
                Set as default portfolio?
              </h2>
              <button
                type="button"
                onClick={() => setShowSetDefaultConfirm(false)}
                className="cursor-pointer px-2 py-0.5 text-2xl leading-none text-text-muted transition-colors hover:text-text-main"
                aria-label="Close"
                disabled={setAsDefaultLoading}
              >
                ×
              </button>
            </div>

            <p className="rounded-lg border border-amber-300/40 bg-amber-100/40 px-3 py-2 text-xs text-amber-700">
              Warning: developer use only. This action updates the template
              baseline used by reset/seed flows.
            </p>
            <p className="mt-3 text-sm text-text-muted">
              Continue only if you intend to replace the default demo/template
              portfolio with your current portfolio.
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSetDefaultConfirm(false)}
                className="cursor-pointer rounded-full border border-transparent px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:border-border-subtle hover:bg-surface-soft hover:text-text-main"
                disabled={setAsDefaultLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSetAsDefault}
                disabled={setAsDefaultLoading}
                className="inline-flex cursor-pointer items-center justify-center rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-70"
              >
                {setAsDefaultLoading ? "Saving…" : "Yes, set as default"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
