import "dotenv/config";
import ws from "ws";
import { PrismaClient, type Holding } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing");
}

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const DEMO_OWNER_ID = "demo";
const TEMPLATE_OWNER_ID = "demo-template";

const holdingKey = (h: Pick<Holding, "cardId" | "grade">) =>
  `${h.cardId}::${h.grade ?? ""}`;

async function main() {
  await prisma.$transaction(async (tx) => {
    // Clean existing template + demo data (idempotent)
    await tx.priceSnapshot.deleteMany({
      where: { ownerId: { in: [DEMO_OWNER_ID, TEMPLATE_OWNER_ID] } },
    });

    await tx.holding.deleteMany({
      where: { ownerId: { in: [DEMO_OWNER_ID, TEMPLATE_OWNER_ID] } },
    });

    // Create template holdings
    await tx.holding.createMany({
      data: [
        {
          ownerId: TEMPLATE_OWNER_ID,
          cardId: "base1-4",
          cardName: "Charizard",
          setName: "Base Set",
          grade: "PSA 10",
          purchasePrice: 2500,
          quantity: 1,
        },
        {
          ownerId: TEMPLATE_OWNER_ID,
          cardId: "base1-2",
          cardName: "Blastoise",
          setName: "Base Set",
          grade: "PSA 9",
          purchasePrice: 900,
          quantity: 1,
        },
        {
          ownerId: TEMPLATE_OWNER_ID,
          cardId: "base1-15",
          cardName: "Venusaur",
          setName: "Base Set",
          grade: "PSA 9",
          purchasePrice: 700,
          quantity: 1,
        },
      ],
    });

    const templateHoldings = await tx.holding.findMany({
      where: { ownerId: TEMPLATE_OWNER_ID },
      orderBy: { createdAt: "asc" },
    });

    // Create template snapshots with varied increases.
    // Roughly half the holdings get a positive increase between 5–36%,
    // the rest stay flat or only slightly up to keep things realistic.
    for (let index = 0; index < templateHoldings.length; index++) {
      const h = templateHoldings[index];
      const base = h.purchasePrice;

      const hasIncrease = index % 2 === 0; // about half of holdings

      let firstValue: number;
      let middleValue: number;
      let latestValue: number;

      if (hasIncrease) {
        // Deterministic "random" percentage between 5% and 36% based on index.
        const t = (index % 10) / 9; // 0..1
        const pct = 0.05 + t * (0.36 - 0.05); // 5%..36%
        latestValue = base * (1 + pct);
        firstValue = base * 0.8;
        middleValue = base * 0.9;
      } else {
        // Keep roughly flat with a small change.
        latestValue = base * 1.02;
        firstValue = base * 0.95;
        middleValue = base;
      }

      await tx.priceSnapshot.createMany({
        data: [
          {
            ownerId: TEMPLATE_OWNER_ID,
            holdingId: h.id,
            value: firstValue,
          },
          { ownerId: TEMPLATE_OWNER_ID, holdingId: h.id, value: middleValue },
          {
            ownerId: TEMPLATE_OWNER_ID,
            holdingId: h.id,
            value: latestValue,
          },
        ],
      });
    }

    // Clone template → demo holdings
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

  console.log("✅ Seeded template + demo data");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
