import type { Holding } from "./types";

export function buildHoldingsCsv(holdings: Holding[]): string {
  const header = [
    "Card ID",
    "Name",
    "Set",
    "Grade",
    "Quantity",
    "Purchase price",
  ];

  const rows = holdings.map((h) => [
    h.cardId,
    h.cardName,
    h.setName,
    h.grade,
    String(h.quantity),
    String(h.purchasePrice),
  ]);

  return [header, ...rows]
    .map((cols) =>
      cols
        .map((c) => {
          const value = String(c).replace(/"/g, '""');
          return `"${value}"`;
        })
        .join(","),
    )
    .join("\n");
}
