import "server-only";
import TCGdex, { Query } from "@tcgdex/sdk";

export type PokemonCardSummary = {
  id: string;
  name: string;
  imageUrl?: string;
  setName?: string;
  rarity?: string;
  /** Card number within the set (e.g. 2 in 2/102). */
  cardNumber?: number;
  /** Total number of cards in the set (e.g. 102 in 2/102). */
  setTotal?: number;
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

type TcgDexCardResume = {
  id: string;
  name: string;
  rarity?: string;
  getCard?: () => Promise<TcgDexCardFull>;
};

type TcgDexCardFull = {
  id: string;
  name: string;
  rarity?: string;
  set: {
    id: string;
    name?: string;
    cardCount?: {
      official?: number;
      total?: number;
    };
  };
  localId?: string | number;
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

    const resumes = (await tcgdex.card.list(
      Query.create()
        .contains("name", q)
        .sort("localId", "ASC")
        .paginate(1, pageSize),
    )) as unknown as TcgDexCardResume[];

    const fullCards = await Promise.all(
      resumes.map(async (resume) => {
        try {
          if (typeof resume.getCard === "function") {
            return (await resume.getCard()) as TcgDexCardFull;
          }
          // Fallback: fetch full card by id if getCard is not available.
          return (await tcgdex.card.get(resume.id)) as TcgDexCardFull;
        } catch (err) {
          console.error(
            "[TCGdex] Failed to load full card for",
            resume.id,
            err,
          );
          return null;
        }
      }),
    );

    return fullCards
      .filter((c): c is TcgDexCardFull => c !== null)
      .map((card) => {
        const imageUrl =
          typeof card.getImageURL === "function"
            ? card.getImageURL("high", "png")
            : undefined;

        const setName = card.set?.name ?? card.set?.id;

        // Prefer the "official" card count if present, otherwise fall back to total,
        // but treat 0 or negative values as "no total".
        const rawTotal =
          card.set?.cardCount?.official ?? card.set?.cardCount?.total;
        const setTotal =
          typeof rawTotal === "number" && rawTotal > 0 ? rawTotal : undefined;

        let cardNumber: number | undefined;
        if (typeof card.localId === "string") {
          const parsed = Number.parseInt(card.localId, 10);
          cardNumber = Number.isNaN(parsed) ? undefined : parsed;
        } else if (typeof card.localId === "number") {
          cardNumber = card.localId;
        }

        return {
          id: card.id,
          name: card.name,
          imageUrl,
          setName,
          rarity: card.rarity,
          cardNumber,
          setTotal,
        };
      });
  } catch (error) {
    console.error("[TCGdex] searchPokemonCards failed:", error);
    return [];
  }
}
