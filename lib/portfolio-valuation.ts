import type { HoldingEdition, HoldingFinish } from "@/lib/holding-options";
import {
  getMarketValueRequestKey,
  getPokemonCardPricingComparables,
} from "@/lib/pokemon-tcg";
import { convertToGbp } from "@/lib/fx";

type SnapshotLike = {
  value: number;
  capturedAt?: Date;
};

type HoldingValuationInput = {
  cardId: string;
  finish: HoldingFinish | unknown;
  edition: HoldingEdition | unknown;
  purchasePrice: number;
  quantity: number;
  snapshots: SnapshotLike[];
};

export type ValuedHolding<T> = T & {
  pricing: {
    currentGbp: number | null;
    baseline30Gbp: number | null;
    change30Pct: number | null;
    currentSource: "cardmarket" | "tcgplayer" | null;
    currentCurrency: string | null;
    isFallback: boolean;
  };
  currentUnitValue: number;
  currentValue: number;
  invested: number;
  profit: number;
  profitPct: number;
};

export async function valuePortfolioHoldings<T extends HoldingValuationInput>(
  holdings: T[],
): Promise<ValuedHolding<T>[]> {
  const marketValueRequests = holdings.map((h) => ({
    cardId: h.cardId,
    finish: h.finish as HoldingFinish,
    edition: h.edition as HoldingEdition,
  }));
  const pricingComparables = await getPokemonCardPricingComparables(
    marketValueRequests,
  );

  return Promise.all(
    holdings.map(async (holding) => {
      const latestSnapshot = holding.snapshots[0];
      const requestKey = getMarketValueRequestKey({
        cardId: holding.cardId,
        finish: holding.finish as HoldingFinish,
        edition: holding.edition as HoldingEdition,
      });

      const comparable = pricingComparables.get(requestKey);
      const current = comparable?.current ?? null;
      const baseline30 = comparable?.baseline30 ?? null;

      const currentGbp =
        current ? await convertToGbp(current.value, current.currency) : null;
      const baseline30Gbp =
        baseline30 ? await convertToGbp(baseline30.value, baseline30.currency) : null;

      const fallbackUnit = latestSnapshot?.value ?? holding.purchasePrice;
      const currentUnitValue = currentGbp ?? fallbackUnit;
      const currentValue = currentUnitValue * holding.quantity;
      const invested = holding.purchasePrice * holding.quantity;
      const profit = currentValue - invested;
      const profitPct = invested === 0 ? 0 : (profit / invested) * 100;

      return {
        ...holding,
        pricing: {
          currentGbp,
          baseline30Gbp,
          change30Pct:
            current?.source === "cardmarket" &&
            baseline30?.source === "cardmarket"
              ? (comparable?.change30Pct ?? null)
              : null,
          currentSource: current?.source ?? null,
          currentCurrency: current?.currency ?? null,
          isFallback: currentGbp === null,
        },
        currentUnitValue,
        currentValue,
        invested,
        profit,
        profitPct,
      };
    }),
  );
}

