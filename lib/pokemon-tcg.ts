import "server-only";

type PokemonTcgCard = {
  id: string;
  name: string;
  images?: { small?: string; large?: string };
  set?: { name?: string };
  rarity?: string;
};

export type PokemonCardSummary = {
  id: string;
  name: string;
  imageUrl?: string;
  setName?: string;
  rarity?: string;
};

const API_BASE = "https://api.pokemontcg.io/v2/cards";

function buildHeaders(): Record<string, string> {
  const apiKey = process.env.POKEMON_TCG_API_KEY;
  return apiKey ? { "X-Api-Key": apiKey } : {};
}

export async function searchPokemonCards(
  query: string,
  pageSize = 10,
): Promise<PokemonCardSummary[]> {
  const q = query.trim();
  if (!q) return [];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1500);

  try {
    const url = new URL(API_BASE);
    // Simple name-based search; this can be refined later.
    url.searchParams.set("q", `name:${q}*`);
    url.searchParams.set("pageSize", String(pageSize));

    const res = await fetch(url.toString(), {
      headers: buildHeaders(),
      next: { revalidate: 60 * 60 }, // cache for an hour
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) return [];

    const json = (await res.json()) as { data?: PokemonTcgCard[] };
    const cards = json.data ?? [];

    return cards.map((card) => ({
      id: card.id,
      name: card.name,
      imageUrl: card.images?.small ?? card.images?.large,
      setName: card.set?.name,
      rarity: card.rarity,
    }));
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("searchPokemonCards failed:", error);
    return [];
  }
}

