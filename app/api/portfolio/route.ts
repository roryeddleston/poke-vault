import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEMO_OWNER_ID } from "@/lib/constants";
import {
  summarizeValuedHoldings,
  toPortfolioApiHoldings,
  valuePortfolioHoldings,
} from "@/lib/portfolio-valuation";

export async function GET() {
  try {
    // Prisma types can lag in long-lived dev sessions; at runtime these fields exist.
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

    const pricedRows = await valuePortfolioHoldings(holdings);
    const summary = summarizeValuedHoldings(pricedRows);
    const cleanedHoldings = toPortfolioApiHoldings(pricedRows);

    return NextResponse.json({
      holdings: cleanedHoldings,
      summary,
    });
  } catch (error) {
    console.error("GET /api/portfolio failed:", error);

    return NextResponse.json(
      { error: "Failed to fetch portfolio" },
      { status: 500 },
    );
  }
}
