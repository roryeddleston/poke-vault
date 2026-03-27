export const HOLDING_FINISHES = ["NORMAL", "HOLO", "REVERSE"] as const;
export const HOLDING_EDITIONS = ["UNLIMITED", "FIRST_EDITION"] as const;

export type HoldingFinish = (typeof HOLDING_FINISHES)[number];
export type HoldingEdition = (typeof HOLDING_EDITIONS)[number];

export const HOLDING_FINISH_LABELS: Record<HoldingFinish, string> = {
  NORMAL: "Normal",
  HOLO: "Holo",
  REVERSE: "Reverse Holo",
};

export const HOLDING_EDITION_LABELS: Record<HoldingEdition, string> = {
  UNLIMITED: "Unlimited",
  FIRST_EDITION: "1st Edition",
};
