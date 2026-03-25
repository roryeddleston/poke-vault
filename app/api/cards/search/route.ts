import { NextRequest, NextResponse } from "next/server";
import { searchPokemonCards } from "@/lib/pokemon-tcg";

export async function GET(request: NextRequest) {
  try {
    const q = (request.nextUrl.searchParams.get("q") ?? "").trim();

    if (q.length < 2) {
      return NextResponse.json([]);
    }

    const cards = await searchPokemonCards(q, 1, 5, {
      imageQuality: "low",
      imageExt: "webp",
    });

    return NextResponse.json(cards);
  } catch (error) {
    console.error("Failed to search Pokémon cards:", error);

    return NextResponse.json(
      { error: "Failed to search Pokémon cards" },
      { status: 500 },
    );
  }
}
