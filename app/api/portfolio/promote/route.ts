import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEMO_OWNER_ID, TEMPLATE_OWNER_ID } from "@/lib/constants";

type HoldingKeyInput = {
  cardId: string;
  grade: string | null;
};

const holdingKey = (h: HoldingKeyInput) =>
  `${h.cardId}::${h.grade ?? ""}`;

// Applied so ~6/7 holdings show value > invested (one slot is 1 = no gain).
const GAIN_MULTIPLIERS = [1.07, 1.12, 1.18, 1.24, 1.56, 2.32, 1] as const;

/**
 * POST /api/portfolio/promote
 *
 * Promotes the current demo portfolio to the template (default for reset/seed).
 * Also adds a new "current" snapshot per holding so that for most holdings
 * the displayed value is above invested (profit).
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

      // Add a new "current" snapshot per holding so latest value shows profit for most
      const now = new Date();
      const demoGainSnapshots = demoHoldings.map((h, i) => ({
        ownerId: DEMO_OWNER_ID,
        holdingId: h.id,
        value: h.purchasePrice * GAIN_MULTIPLIERS[i % GAIN_MULTIPLIERS.length],
        capturedAt: now,
      }));
      const templateGainSnapshots = templateHoldings.map((h, i) => ({
        ownerId: TEMPLATE_OWNER_ID,
        holdingId: h.id,
        value: h.purchasePrice * GAIN_MULTIPLIERS[i % GAIN_MULTIPLIERS.length],
        capturedAt: now,
      }));
      await tx.priceSnapshot.createMany({
        data: [...demoGainSnapshots, ...templateGainSnapshots],
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

