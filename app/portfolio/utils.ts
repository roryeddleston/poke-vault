import type { PortfolioSummary } from "./types";

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

