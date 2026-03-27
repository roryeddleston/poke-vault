import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEMO_OWNER_ID } from "@/lib/constants";
import { valuePortfolioHoldings } from "@/lib/portfolio-valuation";
import type { Prisma } from "@prisma/client";

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

    const pricedRows = await valuePortfolioHoldings(holdings);

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
      const rest = { ...h };
      delete (rest as { invested?: number }).invested;
      delete (rest as { currentValue?: number }).currentValue;
      delete (rest as { currentUnitValue?: number }).currentUnitValue;
      delete (rest as { profit?: number }).profit;
      delete (rest as { profitPct?: number }).profitPct;
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
