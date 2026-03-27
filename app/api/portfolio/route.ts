import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEMO_OWNER_ID } from "@/lib/constants";
import {
  getMarketValueRequestKey,
  getPokemonCardMarketValues,
} from "@/lib/pokemon-tcg";

export async function GET() {
  try {
    const holdings = await prisma.holding.findMany({
      where: { ownerId: DEMO_OWNER_ID },
      orderBy: { createdAt: "desc" },
      include: {
        snapshots: {
          orderBy: { capturedAt: "desc" },
          take: 1, // only latest snapshot for performance
        },
      },
    });

    const marketValueRequests = holdings.map((h) => ({
      cardId: h.cardId,
      finish: h.finish,
      edition: h.edition,
    }));
    const marketValues = await getPokemonCardMarketValues(
      marketValueRequests as any,
    );

    // Compute summary in one pass (O(n))
    let totalInvested = 0;
    let totalValue = 0;

    const holdingsWithMarketPrice = holdings.map((holding) => {
      const latestSnapshot = holding.snapshots[0];
      const requestKey = getMarketValueRequestKey({
        cardId: holding.cardId,
        finish: holding.finish,
        edition: holding.edition,
      });
      const market = marketValues.get(requestKey);
      const currentUnitValue =
        market?.value ?? latestSnapshot?.value ?? holding.purchasePrice;

      const currentValue = currentUnitValue * holding.quantity;
      const invested = holding.purchasePrice * holding.quantity;

      totalInvested += invested;
      totalValue += currentValue;

      const syntheticSnapshot = {
        ...(latestSnapshot ?? { id: "", ownerId: holding.ownerId ?? DEMO_OWNER_ID }),
        value: currentUnitValue,
        capturedAt: latestSnapshot?.capturedAt ?? new Date().toISOString(),
      };

      return {
        ...holding,
        snapshots: [syntheticSnapshot],
      };
    });

    const totalProfit = totalValue - totalInvested;
    const profitPercentage =
      totalInvested === 0 ? 0 : (totalProfit / totalInvested) * 100;

    return NextResponse.json({
      holdings: holdingsWithMarketPrice,
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
