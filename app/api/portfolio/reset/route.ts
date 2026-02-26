import { NextResponse } from "next/server";
import type { Holding } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { DEMO_OWNER_ID, TEMPLATE_OWNER_ID } from "@/lib/constants";

const holdingKey = (h: Pick<Holding, "cardId" | "grade">) =>
  `${h.cardId}::${h.grade ?? ""}`;

/**
 * POST /api/portfolio/reset
 * Resets demo portfolio data to match the template dataset (idempotent).
 * Only affects ownerId=DEMO_OWNER_ID; template data is read-only.
 */
export async function POST() {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.priceSnapshot.deleteMany({
        where: { ownerId: DEMO_OWNER_ID },
      });
      await tx.holding.deleteMany({
        where: { ownerId: DEMO_OWNER_ID },
      });

      const templateHoldings = await tx.holding.findMany({
        where: { ownerId: TEMPLATE_OWNER_ID },
        orderBy: { createdAt: "asc" },
      });

      if (templateHoldings.length === 0) {
        return;
      }

      await tx.holding.createMany({
        data: templateHoldings.map((h) => ({
          ownerId: DEMO_OWNER_ID,
          cardId: h.cardId,
          cardName: h.cardName,
          setName: h.setName,
          grade: h.grade,
          purchasePrice: h.purchasePrice,
          quantity: h.quantity,
        })),
      });

      const demoHoldings = await tx.holding.findMany({
        where: { ownerId: DEMO_OWNER_ID },
      });

      const demoIdByKey = new Map<string, string>();
      for (const h of demoHoldings) {
        demoIdByKey.set(holdingKey(h), h.id);
      }

      const templateSnapshots = await tx.priceSnapshot.findMany({
        where: { ownerId: TEMPLATE_OWNER_ID },
        orderBy: { capturedAt: "asc" },
      });

      const templateKeyById = new Map<string, string>();
      for (const h of templateHoldings) {
        templateKeyById.set(h.id, holdingKey(h));
      }

      await tx.priceSnapshot.createMany({
        data: templateSnapshots.flatMap((s) => {
          const key = templateKeyById.get(s.holdingId);
          if (!key) return [];
          const demoHoldingId = demoIdByKey.get(key);
          if (!demoHoldingId) return [];
          return [
            {
              ownerId: DEMO_OWNER_ID,
              holdingId: demoHoldingId,
              value: s.value,
              capturedAt: s.capturedAt,
            },
          ];
        }),
      });
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/portfolio/reset failed:", error);
    return NextResponse.json(
      { error: "Failed to reset portfolio" },
      { status: 500 }
    );
  }
}
