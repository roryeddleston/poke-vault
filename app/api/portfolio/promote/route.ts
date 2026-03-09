import { NextResponse } from "next/server";
import type { Holding } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { DEMO_OWNER_ID, TEMPLATE_OWNER_ID } from "@/lib/constants";

const holdingKey = (h: Pick<Holding, "cardId" | "grade">) =>
  `${h.cardId}::${h.grade ?? ""}`;

/**
 * POST /api/portfolio/promote
 *
 * One-off helper to promote the current demo portfolio (ownerId=DEMO_OWNER_ID)
 * to become the template dataset (ownerId=TEMPLATE_OWNER_ID).
 *
 * After running this once, POST /api/portfolio/reset will restore to the
 * current demo portfolio snapshot.
 */
export async function POST() {
  try {
    await prisma.$transaction(async (tx) => {
      const demoHoldings = await tx.holding.findMany({
        where: { ownerId: DEMO_OWNER_ID },
        orderBy: { createdAt: "asc" },
      });

      if (demoHoldings.length === 0) {
        return;
      }

      // Clear existing template data.
      await tx.priceSnapshot.deleteMany({
        where: { ownerId: TEMPLATE_OWNER_ID },
      });
      await tx.holding.deleteMany({
        where: { ownerId: TEMPLATE_OWNER_ID },
      });

      // Create template holdings based on current demo holdings.
      await tx.holding.createMany({
        data: demoHoldings.map((h) => {
          const base = {
            ownerId: TEMPLATE_OWNER_ID,
            cardId: h.cardId,
            cardName: h.cardName,
            setName: h.setName,
            grade: h.grade,
            purchasePrice: h.purchasePrice,
            quantity: h.quantity,
          };

          return {
            ...base,
            // These optional fields exist in the DB schema; TS may lag behind
            // in some environments, so we guard them at runtime only.
            ...(Object.prototype.hasOwnProperty.call(h, "imageUrl") && {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              imageUrl: (h as any).imageUrl,
            }),
            ...(Object.prototype.hasOwnProperty.call(h, "cardNumber") && {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              cardNumber: (h as any).cardNumber,
            }),
            ...(Object.prototype.hasOwnProperty.call(h, "setTotal") && {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              setTotal: (h as any).setTotal,
            }),
          };
        }),
      });

      const templateHoldings = await tx.holding.findMany({
        where: { ownerId: TEMPLATE_OWNER_ID },
        orderBy: { createdAt: "asc" },
      });

      const demoKeyById = new Map<string, string>();
      for (const h of demoHoldings) {
        demoKeyById.set(h.id, holdingKey(h));
      }

      const templateIdByKey = new Map<string, string>();
      for (const h of templateHoldings) {
        templateIdByKey.set(holdingKey(h), h.id);
      }

      const demoSnapshots = await tx.priceSnapshot.findMany({
        where: { ownerId: DEMO_OWNER_ID },
        orderBy: { capturedAt: "asc" },
      });

      await tx.priceSnapshot.createMany({
        data: demoSnapshots.flatMap((s) => {
          const key = demoKeyById.get(s.holdingId);
          if (!key) return [];

          const templateHoldingId = templateIdByKey.get(key);
          if (!templateHoldingId) return [];

          return [
            {
              ownerId: TEMPLATE_OWNER_ID,
              holdingId: templateHoldingId,
              value: s.value,
              capturedAt: s.capturedAt,
            },
          ];
        }),
      });
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/portfolio/promote failed:", error);
    return NextResponse.json(
      { error: "Failed to promote demo portfolio to template" },
      { status: 500 },
    );
  }
}

