import type { Holding } from "../types";

export function getHoldingLatestValue(holding: Holding): number {
  return (
    holding.pricing?.currentGbp ??
    holding.snapshots[0]?.value ??
    holding.purchasePrice
  );
}

export function getReturnVsPaid(holding: Holding): number | null {
  const current = getHoldingLatestValue(holding);
  const paid = holding.purchasePrice;

  if (!Number.isFinite(paid) || paid <= 0) return null;
  return ((current - paid) / paid) * 100;
}

