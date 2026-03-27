import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEMO_OWNER_ID } from "@/lib/constants";
import { createHoldingSchema } from "@/lib/validators/holding";
import { getPokemonCardVariants } from "@/lib/pokemon-tcg";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createHoldingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      cardId,
      cardName,
      setName,
      imageUrl,
      cardNumber,
      setTotal,
      grade,
      finish,
      edition,
      purchasePrice,
      quantity,
    } = parsed.data;

    const variants = await getPokemonCardVariants(cardId);
    if (variants) {
      const finishAllowed =
        (finish === "NORMAL" && !!variants.normal) ||
        (finish === "HOLO" && !!variants.holo) ||
        (finish === "REVERSE" && !!variants.reverse);
      if (!finishAllowed) {
        return NextResponse.json(
          { error: `Selected finish is not available for ${cardName}.` },
          { status: 400 },
        );
      }
      if (edition === "FIRST_EDITION" && !variants.firstEdition) {
        return NextResponse.json(
          { error: `${cardName} does not have a 1st Edition variant.` },
          { status: 400 },
        );
      }
    }

    // Use SQL upsert to avoid stale Prisma client metadata in long-lived dev sessions.
    // This relies on the DB unique index: (ownerId, cardId, grade, finish, edition).
    const rows = await prisma.$queryRaw<
      Array<{
        id: string;
        ownerId: string;
        cardId: string;
        cardName: string;
        setName: string;
        imageUrl: string | null;
        cardNumber: number | null;
        setTotal: number | null;
        grade: string;
        finish: string;
        edition: string;
        purchasePrice: number;
        quantity: number;
        createdAt: Date;
      }>
    >`
      INSERT INTO "Holding" (
        "id", "ownerId", "cardId", "cardName", "setName",
        "imageUrl", "cardNumber", "setTotal", "grade", "finish",
        "edition", "purchasePrice", "quantity"
      )
      VALUES (
        ${randomUUID()}, ${DEMO_OWNER_ID}, ${cardId}, ${cardName}, ${setName},
        ${imageUrl ?? null}, ${cardNumber ?? null}, ${setTotal ?? null}, ${grade}, ${finish},
        ${edition}, ${purchasePrice}, ${quantity}
      )
      ON CONFLICT ("ownerId", "cardId", "grade", "finish", "edition")
      DO UPDATE SET
        "quantity" = "Holding"."quantity" + EXCLUDED."quantity"
      RETURNING
        "id", "ownerId", "cardId", "cardName", "setName",
        "imageUrl", "cardNumber", "setTotal", "grade", "finish",
        "edition", "purchasePrice", "quantity", "createdAt";
    `;

    const holding = rows[0];
    if (!holding) {
      return NextResponse.json(
        { error: "Failed to create holding" },
        { status: 500 },
      );
    }

    return NextResponse.json({ holding }, { status: 201 });
  } catch (error) {
    console.error("POST /api/holdings failed:", error);

    return NextResponse.json(
      { error: "Failed to create holding" },
      { status: 500 }
    );
  }
}
