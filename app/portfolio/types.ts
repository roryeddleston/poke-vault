export type HoldingSnapshot = {
  value: number;
  capturedAt: string;
};

export type Holding = {
  id: string;
  cardId: string;
  cardName: string;
  setName: string;
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
