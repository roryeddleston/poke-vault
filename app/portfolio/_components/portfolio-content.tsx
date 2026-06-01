"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { PortfolioResponse } from "../types";
import { buildHoldingsCsv } from "../csv";
import { PortfolioFilterBar } from "./filter-bar";
import { HoldingsTable } from "./holdings-table";
import { Pagination } from "./pagination";
import { PortfolioHeader } from "./header";
import { SummaryCards } from "./summary-cards";
import { AddHoldingDialog } from "./add-holding-dialog";
import { SetAsDefaultModal } from "./set-as-default-modal";
import { usePortfolioView, PAGE_SIZE } from "./use-portfolio-view";

type PortfolioContentProps = {
  data: PortfolioResponse;
};

export function PortfolioContent({ data }: PortfolioContentProps) {
  const router = useRouter();
  const {
    search,
    filters,
    quickPreset,
    page,
    filteredHoldings,
    availableGrades,
    availableSets,
    paginatedHoldings,
    onSearchChange,
    onRemoveFilter,
    onClearAll,
    onQuickPresetChange,
    onAddFilter,
    onPageChange,
  } = usePortfolioView(data.holdings);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showSetDefaultConfirm, setShowSetDefaultConfirm] = useState(false);
  const [setAsDefaultLoading, setSetAsDefaultLoading] = useState(false);

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

    const csv = buildHoldingsCsv(filteredHoldings);

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
        view={{
          search,
          filters,
          quickPreset,
          availableGrades,
          availableSets,
          canExport: filteredHoldings.length > 0,
        }}
        actions={{
          onSearchChange,
          onQuickPresetChange,
          onRemoveFilter,
          onClearAll,
          onAddFilter,
          onExport: handleExport,
        }}
      />
      <HoldingsTable
        holdings={paginatedHoldings}
        totalCount={filteredHoldings.length}
      />
      <Pagination
        totalItems={filteredHoldings.length}
        pageSize={PAGE_SIZE}
        currentPage={page}
        onPageChange={onPageChange}
      />
      <AddHoldingDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
      />
      <SetAsDefaultModal
        open={showSetDefaultConfirm}
        loading={setAsDefaultLoading}
        onClose={() => setShowSetDefaultConfirm(false)}
        onConfirm={handleSetAsDefault}
      />
    </>
  );
}
