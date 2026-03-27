import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEMO_OWNER_ID } from "@/lib/constants";
import {
  getMarketValueRequestKey,
  getPokemonCardPricingComparables,
} from "@/lib/pokemon-tcg";
import { convertToGbp } from "@/lib/fx";
import type { Prisma } from "@prisma/client";
import type { HoldingEdition, HoldingFinish } from "@/lib/holding-options";

type HoldingRow = Prisma.HoldingGetPayload<{
  include: {
    snapshots: { orderBy: { capturedAt: "desc" }; take: 1 };
  };
}> & {
  finish: unknown;
  edition: unknown;
};

export async function GET() {
  try {
    // Prisma types can lag in long-lived dev sessions; at runtime these fields exist.
    const holdings = (await prisma.holding.findMany({
      where: { ownerId: DEMO_OWNER_ID },
      orderBy: { createdAt: "desc" },
      include: {
        snapshots: {
          orderBy: { capturedAt: "desc" },
          take: 1, // only latest snapshot for performance
        },
      },
    })) as unknown as HoldingRow[];

    const marketValueRequests = holdings.map((h) => ({
      cardId: h.cardId,
      finish: h.finish as unknown as HoldingFinish,
      edition: h.edition as unknown as HoldingEdition,
    }));
    const pricingComparables = await getPokemonCardPricingComparables(
      marketValueRequests,
    );

    const pricedRows = await Promise.all(
      holdings.map(async (holding) => {
        const latestSnapshot = holding.snapshots[0];
        const requestKey = getMarketValueRequestKey({
          cardId: holding.cardId,
          finish: holding.finish as unknown as HoldingFinish,
          edition: holding.edition as unknown as HoldingEdition,
        });

        const comparable = pricingComparables.get(requestKey);
        const current = comparable?.current ?? null;
        const baseline30 = comparable?.baseline30 ?? null;

        const currentGbp =
          current ? await convertToGbp(current.value, current.currency) : null;
        const baseline30Gbp =
          baseline30 ? await convertToGbp(baseline30.value, baseline30.currency) : null;

        // Strict fallbacks:
        // - Use live market price when available + convertible.
        // - Else fall back to latest snapshot (assumed GBP) if present.
        // - Else fall back to purchasePrice (strictly necessary to avoid showing 0 value).
        const fallbackUnit = latestSnapshot?.value ?? holding.purchasePrice;
        const effectiveUnitValue = currentGbp ?? fallbackUnit;
        const isFallback = currentGbp === null;

        const syntheticSnapshot = {
          ...(latestSnapshot ?? { id: "", ownerId: holding.ownerId ?? DEMO_OWNER_ID }),
          value: effectiveUnitValue,
          capturedAt: latestSnapshot?.capturedAt ?? new Date().toISOString(),
        };

        return {
          ...holding,
          snapshots: [syntheticSnapshot],
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
            isFallback,
          },
          invested: holding.purchasePrice * holding.quantity,
          currentValue: effectiveUnitValue * holding.quantity,
        };
      }),
    );

    const totals = pricedRows.reduce(
      (acc, h) => {
        acc.totalInvested += h.invested;
        acc.totalValue += h.currentValue;
        return acc;
      },
      { totalInvested: 0, totalValue: 0 },
    );
    const totalInvested = totals.totalInvested;
    const totalValue = totals.totalValue;

    const cleanedHoldings = pricedRows.map((h) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { invested, currentValue, ...rest } = h;
      return rest;
    });

    const totalProfit = totalValue - totalInvested;
    const profitPercentage =
      totalInvested === 0 ? 0 : (totalProfit / totalInvested) * 100;

    return NextResponse.json({
      holdings: cleanedHoldings,
      summary: {
        totalInvested,
        totalValue,
        totalProfit,
        profitPercentage,
      },
    });
  } catch (error) {
    console.error("GET /api/portfolio failed:", error);

    return NextResponse.json(
      { error: "Failed to fetch portfolio" },
      { status: 500 },
    );
  }
}
