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
  purchasePrice: number;
  quantity: number;
  snapshots: HoldingSnapshot[];
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
