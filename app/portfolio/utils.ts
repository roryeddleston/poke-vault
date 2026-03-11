import type { Holding, PortfolioSummary } from "./types";

export type FilterEntry = { key: "grade" | "set"; value: string };
export type QuickPreset = "all" | "graded" | "raw" | "recent";

export function filterHoldings(
  holdings: Holding[],
  search: string,
  filters: FilterEntry[],
  quickPreset: QuickPreset = "all",
): Holding[] {
  const q = search.trim().toLowerCase();

  let result = holdings.filter((h) => {
    const normalizedGrade = (h.grade ?? "").trim().toUpperCase();

    if (quickPreset === "graded" && (!normalizedGrade || normalizedGrade === "RAW")) {
      return false;
    }
    if (quickPreset === "raw" && normalizedGrade !== "RAW") {
      return false;
    }

    if (q) {
      const matchesSearch =
        h.cardName.toLowerCase().includes(q) ||
        h.setName.toLowerCase().includes(q) ||
        h.cardId.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }

    for (const f of filters) {
      if (f.key === "grade" && h.grade !== f.value) return false;
      if (f.key === "set" && h.setName !== f.value) return false;
    }
    return true;
  });

  if (quickPreset === "recent") {
    result = [...result].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }

  return result;
}

export function getUniqueGrades(holdings: Holding[]): string[] {
  const set = new Set(holdings.map((h) => h.grade));
  return Array.from(set).sort();
}

export function getUniqueSets(holdings: Holding[]): string[] {
  const set = new Set(holdings.map((h) => h.setName));
  return Array.from(set).sort();
}

export function formatGBP(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPct(value: number) {
  return new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function hasAnyValue(summary: PortfolioSummary) {
  return (
    summary.totalInvested > 0 ||
    summary.totalValue > 0 ||
    summary.totalProfit !== 0 ||
    summary.profitPercentage !== 0
  );
}
