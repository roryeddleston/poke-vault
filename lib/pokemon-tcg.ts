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
  page = 1,
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
    // "Pikachu 60/64" -> namePart: "Pikachu", nameNumberPart: "60", nameTotalPart: "64"
    const nameAndNumberMatch = q.match(/^(.*?)(\d+)(?:\s*\/\s*(\d+))?$/);
    const namePart = nameAndNumberMatch?.[1]?.trim() || "";
    const nameNumberPart = nameAndNumberMatch?.[2];
    const nameTotalPart = nameAndNumberMatch?.[3];

    // If the query is just a number or "12/72", capture that too.
    // "60/64" -> pureLocalId: "60/64"
    const pureNumberMatch = q.match(/^(\d+)(?:\s*\/\s*(\d+))?$/);
    const pureNumberPart = pureNumberMatch?.[1];
    const pureTotalPart = pureNumberMatch?.[2];
    const effectiveName = namePart || (!pureNumberPart ? q : "");

    // 1) If the query looks like a full card ID (e.g. "swsh3-012"), try exact id first.
    if (q.includes("-")) {
      queries.push(
        Query.create()
          .equal("id", q)
          .paginate(page, pageSize),
      );
    }

    // 2) If we have both a name and a trailing number, search for that combo:
    //    name contains "Pikachu" AND localId == "60".
    if (namePart && nameNumberPart) {
      queries.push(
        Query.create()
          .contains("name", namePart)
          .equal("localId", nameNumberPart)
          .paginate(page, pageSize),
      );
    }

    // 3) If the whole query looks like "60" or "60/64", search by exact card number within the set.
    if (pureNumberPart) {
      queries.push(
        Query.create()
          .equal("localId", pureNumberPart)
          .sort("localId", "ASC")
          .paginate(page, pageSize),
      );
    }

    // 4) Finally, search by name (if we have any non-numeric name part).
    if (effectiveName) {
      queries.push(
        Query.create()
          .contains("name", effectiveName)
          .sort("localId", "ASC")
          .paginate(page, pageSize),
      );
    }

    const resumeArrays = await Promise.all(
      queries.map((qry) =>
        tcgdex.card.list(qry) as unknown as Promise<TcgDexCardResume[]>,
      ),
    );

    // Merge and de-duplicate by id, keeping a reasonable pool for scoring.
    const seen = new Set<string>();
    const merged: TcgDexCardResume[] = [];
    const maxMerged = pageSize * 5;
    for (const list of resumeArrays) {
      for (const r of list) {
        if (!seen.has(r.id)) {
          seen.add(r.id);
          merged.push(r);
          if (merged.length >= maxMerged) break;
        }
      }
      if (merged.length >= maxMerged) break;
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

    const nonNullCards = fullCards.filter(
      (c): c is TcgDexCardFull => c !== null,
    );

    const summaries = nonNullCards.map((card) => {
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

    // Scoring: favour matches on name, card number, and set total.
    const nameHint = namePart.toLowerCase();
    const numberHint =
      nameNumberPart ?? pureNumberPart ?? undefined;
    const numberHintValue = numberHint
      ? Number.parseInt(numberHint, 10)
      : undefined;
    const desiredTotalRaw = nameTotalPart ?? pureTotalPart;
    const desiredTotal =
      desiredTotalRaw !== undefined
        ? Number.parseInt(desiredTotalRaw, 10)
        : undefined;

    const scored = summaries.map((s) => {
      let score = 0;

      if (nameHint && s.name.toLowerCase().includes(nameHint)) {
        score += 3;
      }
      if (
        numberHintValue !== undefined &&
        Number.isFinite(numberHintValue) &&
        s.cardNumber === numberHintValue
      ) {
        score += 5;
      }
      if (
        desiredTotal !== undefined &&
        Number.isFinite(desiredTotal) &&
        s.setTotal === desiredTotal
      ) {
        score += 2;
      }

      return { summary: s, score };
    });

    scored.sort((a, b) => b.score - a.score);

    // Return the best-matching slice for this page.
    const startIndex = (page - 1) * pageSize;
    const pageSlice = scored
      .slice(startIndex, startIndex + pageSize)
      .map((s) => s.summary);

    return pageSlice;
  } catch (error) {
    console.error("[TCGdex] searchPokemonCards failed:", error);
    return [];
  }
}

/**
 * Fetch multiple pages of search results from TCGdex and merge them client-side.
 * This is more expensive, so only use it where you truly need the global set
 * of matches (e.g. for paginating in the UI with an accurate total count).
 */
export async function searchPokemonCardsAll(
  query: string,
  perPage = 50,
  maxPages = 10,
): Promise<PokemonCardSummary[]> {
  const all: PokemonCardSummary[] = [];
  const seen = new Set<string>();

  for (let page = 1; page <= maxPages; page++) {
    const pageResults = await searchPokemonCards(query, page, perPage);
    const newOnThisPage = pageResults.filter((c) => !seen.has(c.id));
    for (const card of newOnThisPage) {
      seen.add(card.id);
      all.push(card);
    }
    // If we received fewer than perPage results, we've likely exhausted matches.
    if (pageResults.length < perPage) {
      break;
    }
  }

  return all;
}
