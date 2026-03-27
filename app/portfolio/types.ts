import type { HoldingEdition, HoldingFinish } from "@/lib/holding-options";

export type HoldingSnapshot = {
  value: number;
  capturedAt: string;
};

export type Holding = {
  id: string;
  createdAt?: string;
  cardId: string;
  cardName: string;
  setName: string;
  imageUrl?: string | null;
  cardNumber?: number | null;
  setTotal?: number | null;
  grade: string;
  finish: HoldingFinish;
  edition: HoldingEdition;
  purchasePrice: number;
  quantity: number;
  snapshots: HoldingSnapshot[];
  pricing?: {
    /** Market unit price in GBP, if available. */
    currentGbp: number | null;
    /** Cardmarket 30d baseline in GBP, only when available like-for-like. */
    baseline30Gbp: number | null;
    /** Like-for-like change %, typically (Cardmarket trend vs avg30). */
    change30Pct: number | null;
    /** Underlying source used for current price (before GBP conversion). */
    currentSource: "cardmarket" | "tcgplayer" | null;
    /** Underlying currency reported by the source. */
    currentCurrency: string | null;
    /** True when current price is not live market data. */
    isFallback: boolean;
  };
};

export type PortfolioSummary = {
  totalInvested: number;
  totalValue: number;
  totalProfit: number;
  profitPercentage: number;
};

export type PortfolioResponse = {
  holdings: Holding[];
  summary: PortfolioSummary;
};
