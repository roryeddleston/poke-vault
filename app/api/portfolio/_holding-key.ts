type HoldingKeyInput = {
  cardId: string;
  grade: string | null;
  finish: string;
  edition: string;
};

export const holdingKey = (h: HoldingKeyInput): string =>
  `${h.cardId}::${h.grade ?? ""}::${h.finish}::${h.edition}`;
