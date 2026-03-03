import "server-only";
import TCGdex, { Query } from "@tcgdex/sdk";

export type PokemonCardSummary = {
  id: string;
  name: string;
  imageUrl?: string;
  setName?: string;
  rarity?: string;
};

let tcgdexClient: TCGdex | null = null;

function getTcgDex(): TCGdex {
  if (!tcgdexClient) {
    tcgdexClient = new TCGdex("en");
    // Cache responses inside the SDK for an hour.
    tcgdexClient.setCacheTTL(60 * 60);
  }
  return tcgdexClient;
}

type TcgDexCard = {
  id: string;
  name: string;
  rarity?: string;
  set?: {
    id: string;
    name?: string;
  };
  getImageURL?: (quality: "high" | "low", ext: "png" | "webp") => string;
};

export async function searchPokemonCards(
  query: string,
  pageSize = 10,
): Promise<PokemonCardSummary[]> {
  const q = query.trim();
  if (!q) return [];

  try {
    const tcgdex = getTcgDex();

    const cards = (await tcgdex.card.list(
      Query.create()
        .contains("name", q)
        .sort("localId", "ASC")
        .paginate(1, pageSize),
    )) as unknown as TcgDexCard[];

    return cards.map((card) => {
      const imageUrl =
        typeof card.getImageURL === "function"
          ? card.getImageURL("high", "png")
          : undefined;

      const setName = card.set?.name ?? card.set?.id;

      return {
        id: card.id,
        name: card.name,
        imageUrl,
        setName,
        rarity: card.rarity,
      };
    });
  } catch (error) {
    console.error("[TCGdex] searchPokemonCards failed:", error);
    return [];
  }
}
