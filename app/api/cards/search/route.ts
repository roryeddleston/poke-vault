import { NextRequest, NextResponse } from "next/server";
import { searchPokemonCards } from "@/lib/pokemon-tcg";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q") ?? "";

  // Basic guard: avoid hammering the API with empty/very short queries.
  if (!q || q.trim().length < 2) {
    return NextResponse.json([]);
  }

  const cards = await searchPokemonCards(q, 5);

  return NextResponse.json(cards);
}

