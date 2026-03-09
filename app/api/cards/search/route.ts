import { NextRequest, NextResponse } from "next/server";
import { searchPokemonCards } from "@/lib/pokemon-tcg";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q") ?? "";

  // Basic guard: avoid hammering the API with empty/very short queries.
  if (!q || q.trim().length < 2) {
    return NextResponse.json([]);
  }

  // Autocomplete only needs the first page of a few results.
  const cards = await searchPokemonCards(q, 1, 5);

  return NextResponse.json(cards);
}

