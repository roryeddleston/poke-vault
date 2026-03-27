import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEMO_OWNER_ID } from "@/lib/constants";
import { createHoldingSchema } from "@/lib/validators/holding";
import { getPokemonCardVariants } from "@/lib/pokemon-tcg";

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

    // Note: Prisma client types can lag behind schema changes in long-lived dev sessions.
    // Runtime behavior is correct as long as migrations + `prisma generate` are up to date.
    const holding = await prisma.holding.upsert({
      where: {
        ownerId_cardId_grade_finish_edition: {
          ownerId: DEMO_OWNER_ID,
          cardId,
          grade,
          finish,
          edition,
        },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        ownerId: DEMO_OWNER_ID,
        cardId,
        cardName,
        setName,
        ...(imageUrl ? { imageUrl } : {}),
        ...(cardNumber ? { cardNumber } : {}),
        ...(setTotal ? { setTotal } : {}),
        grade,
        finish,
        edition,
        purchasePrice,
        quantity,
      },
    } as any);

    return NextResponse.json({ holding }, { status: 201 });
  } catch (error) {
    console.error("POST /api/holdings failed:", error);

    return NextResponse.json(
      { error: "Failed to create holding" },
      { status: 500 }
    );
  }
}
