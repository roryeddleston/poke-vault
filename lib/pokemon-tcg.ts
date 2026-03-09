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

    // Build up one or more queries so we can match by:
    // - exact ID when the user pastes a full code like "swsh3-012"
    // - combined "Pikachu 60/64" (name + number)
    // - card number within the set (localId), e.g. "60" or "60/64"
    // - name (substring)
    // We will execute all of them, but merge results in the above priority order.
    const queries: Query[] = [];

    // Try to extract a trailing number or number/total, e.g.:
    // "Pikachu 60/64" -> namePart: "Pikachu", numberPart: "60"
    const nameAndNumberMatch = q.match(/^(.*?)(\d+)(?:\s*\/\s*\d+)?$/);
    const namePart = nameAndNumberMatch?.[1]?.trim() || "";
    const trailingNumber = nameAndNumberMatch?.[2];

    // If the query is just a number or "12/72", capture that too.
    const pureNumberMatch = q.match(/^(\d+)(?:\s*\/\s*\d+)?$/);
    const pureNumber = pureNumberMatch?.[1];

    const effectiveName = namePart || (!pureNumber ? q : "");

    // 1) If the query looks like a full card ID (e.g. "swsh3-012"), try exact id first.
    if (q.includes("-")) {
      queries.push(
        Query.create()
          .equal("id", q)
          .paginate(1, pageSize),
      );
    }

    // 2) If we have both a name and a trailing number, search for that combo:
    //    name contains "Pikachu" AND localId == 60.
    if (namePart && trailingNumber) {
      queries.push(
        Query.create()
          .contains("name", namePart)
          .equal("localId", trailingNumber)
          .paginate(1, pageSize),
      );
    }

    // 3) If the whole query looks like "60" or "60/64", search by exact localId.
    if (pureNumber) {
      queries.push(
        Query.create()
          .equal("localId", pureNumber)
          .sort("localId", "ASC")
          .paginate(1, pageSize),
      );
    }

    // 4) Finally, search by name (if we have any non-numeric name part).
    if (effectiveName) {
      queries.push(
        Query.create()
          .contains("name", effectiveName)
          .sort("localId", "ASC")
          .paginate(1, pageSize),
      );
    }

    const resumeArrays = await Promise.all(
      queries.map((qry) =>
        tcgdex.card.list(qry) as unknown as Promise<TcgDexCardResume[]>,
      ),
    );

    // Merge and de-duplicate by id, then enforce pageSize limit.
    const seen = new Set<string>();
    const merged: TcgDexCardResume[] = [];
    for (const list of resumeArrays) {
      for (const r of list) {
        if (!seen.has(r.id)) {
          seen.add(r.id);
          merged.push(r);
          if (merged.length >= pageSize) break;
        }
      }
      if (merged.length >= pageSize) break;
    }

    const resumes = merged;

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
