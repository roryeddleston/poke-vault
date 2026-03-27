export const HOLDING_FINISHES = ["NORMAL", "HOLO", "REVERSE"] as const;
export const HOLDING_EDITIONS = ["UNLIMITED", "FIRST_EDITION"] as const;

export type HoldingFinish = (typeof HOLDING_FINISHES)[number];
export type HoldingEdition = (typeof HOLDING_EDITIONS)[number];
export const DEFAULT_HOLDING_FINISH: HoldingFinish = "NORMAL";
export const DEFAULT_HOLDING_EDITION: HoldingEdition = "UNLIMITED";

export const HOLDING_FINISH_LABELS: Record<HoldingFinish, string> = {
  NORMAL: "Normal",
  HOLO: "Holo",
  REVERSE: "Reverse Holo",
};

export const HOLDING_EDITION_LABELS: Record<HoldingEdition, string> = {
  UNLIMITED: "Unlimited",
  FIRST_EDITION: "1st Edition",
};

export function isHoldingFinish(value: unknown): value is HoldingFinish {
  return typeof value === "string" && HOLDING_FINISHES.includes(value as HoldingFinish);
}

export function isHoldingEdition(value: unknown): value is HoldingEdition {
  return typeof value === "string" && HOLDING_EDITIONS.includes(value as HoldingEdition);
}

export function coerceHoldingFinish(value: unknown): HoldingFinish {
  return isHoldingFinish(value) ? value : DEFAULT_HOLDING_FINISH;
}

export function coerceHoldingEdition(value: unknown): HoldingEdition {
  return isHoldingEdition(value) ? value : DEFAULT_HOLDING_EDITION;
}
