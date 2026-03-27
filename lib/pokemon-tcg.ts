import "server-only";
import TCGdex, { Query } from "@tcgdex/sdk";
import type { HoldingEdition, HoldingFinish } from "@/lib/holding-options";
import type { CurrencyCode } from "@/lib/fx";

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
  variants?: {
    firstEdition?: boolean;
    holo?: boolean;
    normal?: boolean;
    reverse?: boolean;
  };
};

type SearchImageOptions = {
  imageQuality?: "high" | "low";
  imageExt?: "png" | "webp";
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
  variants?: {
    firstEdition?: boolean;
    holo?: boolean;
    normal?: boolean;
    reverse?: boolean;
  };
  pricing?: {
    cardmarket?: Record<string, number | string | undefined>;
    tcgplayer?: Record<
      string,
      {
        marketPrice?: number;
        midPrice?: number;
        lowPrice?: number;
      }
    >;
  };
};

export async function searchPokemonCards(
  query: string,
  page = 1,
  pageSize = 10,
  imageOptions: SearchImageOptions = {},
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
      queries.push(Query.create().equal("id", q).paginate(page, pageSize));
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
      queries.map(async (qry) => {
        const rows = await tcgdex.card.list(qry);
        return Array.isArray(rows) ? (rows as TcgDexCardResume[]) : [];
      }),
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

    const imageQuality = imageOptions.imageQuality ?? "high";
    const imageExt = imageOptions.imageExt ?? "png";

    const summaries = nonNullCards.map((card) => {
      const imageUrl =
        typeof card.getImageURL === "function"
          ? card.getImageURL(imageQuality, imageExt)
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
        variants: card.variants,
      };
    });

    // Scoring: favour matches on name, card number, and set total.
    const nameHint = namePart.toLowerCase();
    const numberHint = nameNumberPart ?? pureNumberPart ?? undefined;
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

export async function getPokemonCardVariants(
  cardId: string,
): Promise<PokemonCardSummary["variants"] | null> {
  try {
    const tcgdex = getTcgDex();
    const card = (await tcgdex.card.get(cardId)) as TcgDexCardFull | null;
    return card?.variants ?? null;
  } catch (error) {
    console.error("[TCGdex] getPokemonCardVariants failed:", error);
    return null;
  }
}

export type MarketValueRequest = {
  cardId: string;
  finish: HoldingFinish;
  edition: HoldingEdition;
};

export type PokemonCardMarketValue = {
  value: number;
  source: "cardmarket" | "tcgplayer";
  currency: CurrencyCode | string;
};

const TCGPLAYER_PRICE_FIELDS = ["marketPrice", "midPrice", "lowPrice"] as const;
type CardmarketMetric = "trend" | "avg30" | "avg7" | "avg" | "low";

export function getMarketValueRequestKey(request: MarketValueRequest) {
  return `${request.cardId}::${request.finish}::${request.edition}`;
}

export type PokemonCardPricingComparables = {
  /**
   * Chosen "current" unit price for display and totals.
   * Prefer Cardmarket trend, then Cardmarket avg30, then a TCGplayer market price.
   */
  current: PokemonCardMarketValue | null;
  /**
   * Like-for-like baseline for change calculations.
   * Only populated when Cardmarket avg30 exists for the same finish/edition.
   */
  baseline30: PokemonCardMarketValue | null;
  /**
   * Percentage change between current comparable and baseline30 (like-for-like only).
   * Null when baseline is missing or current is not from Cardmarket.
   */
  change30Pct: number | null;
};

export async function getPokemonCardPricingComparables(
  requests: MarketValueRequest[],
): Promise<Map<string, PokemonCardPricingComparables>> {
  const uniqueRequests = Array.from(
    new Map(requests.map((r) => [getMarketValueRequestKey(r), r])).values(),
  );

  const results = await Promise.all(
    uniqueRequests.map(async (request) => {
      const value = await getPokemonCardPricingComparable(request);
      return [getMarketValueRequestKey(request), value] as const;
    }),
  );

  const out = new Map<string, PokemonCardPricingComparables>();
  for (const [key, value] of results) {
    if (value) out.set(key, value);
  }
  return out;
}

async function getPokemonCardPricingComparable(
  request: MarketValueRequest,
): Promise<PokemonCardPricingComparables | null> {
  try {
    const tcgdex = getTcgDex();
    const card = (await tcgdex.card.get(request.cardId)) as TcgDexCardFull;

    const cardmarketTrend = extractCardmarketMetric(
      card.pricing?.cardmarket,
      request.finish,
      request.edition,
      "trend",
    );
    const cardmarketAvg30 = extractCardmarketMetric(
      card.pricing?.cardmarket,
      request.finish,
      request.edition,
      "avg30",
    );

    const current =
      cardmarketTrend ??
      cardmarketAvg30 ??
      extractTcgplayerValue(
        card.pricing?.tcgplayer,
        request.finish,
        request.edition,
      );

    const baseline30 = cardmarketAvg30;

    const change30Pct =
      current?.source === "cardmarket" &&
      baseline30?.source === "cardmarket" &&
      baseline30.value > 0
        ? ((current.value - baseline30.value) / baseline30.value) * 100
        : null;

    return { current, baseline30, change30Pct };
  } catch (error) {
    console.error("[TCGdex] getPokemonCardPricingComparable failed:", error);
    return null;
  }
}

function extractCardmarketMetric(
  pricing: Record<string, number | string | undefined> | undefined,
  finish: HoldingFinish,
  edition: HoldingEdition,
  metric: CardmarketMetric,
): PokemonCardMarketValue | null {
  if (!pricing) return null;
  const suffixes = getCardmarketSuffixes(finish, edition);

  for (const suffix of suffixes) {
    const key = `${metric}${suffix}`;
    const value = pricing[key];
    if (typeof value === "number" && Number.isFinite(value) && value > 0) {
      return {
        value,
        source: "cardmarket",
        currency: String(pricing.unit ?? "EUR"),
      };
    }
  }
  const fallback = pricing[metric];
  if (
    typeof fallback === "number" &&
    Number.isFinite(fallback) &&
    fallback > 0
  ) {
    return {
      value: fallback,
      source: "cardmarket",
      currency: String(pricing.unit ?? "EUR"),
    };
  }
  return null;
}

function extractTcgplayerValue(
  pricing:
    | Record<
        string,
        {
          marketPrice?: number;
          midPrice?: number;
          lowPrice?: number;
        }
      >
    | undefined,
  finish: HoldingFinish,
  edition: HoldingEdition,
): PokemonCardMarketValue | null {
  if (!pricing) return null;
  const variantKeys = getTcgplayerVariantKeys(finish, edition);

  for (const variant of variantKeys) {
    const prices = pricing[variant];
    if (!prices) continue;
    for (const field of TCGPLAYER_PRICE_FIELDS) {
      const value = prices[field];
      if (typeof value === "number" && Number.isFinite(value) && value > 0) {
        return {
          value,
          source: "tcgplayer",
          currency: "USD",
        };
      }
    }
  }

  return null;
}

function getCardmarketSuffixes(finish: HoldingFinish, edition: HoldingEdition) {
  const base =
    finish === "HOLO" ? ["-holo"] : finish === "REVERSE" ? ["-reverse"] : [""];
  if (edition === "FIRST_EDITION") {
    return base.flatMap((s) => [`${s}-1st-edition`, `${s}-first-edition`, s]);
  }
  return base;
}

function getTcgplayerVariantKeys(
  finish: HoldingFinish,
  edition: HoldingEdition,
) {
  const byFinish =
    finish === "HOLO"
      ? ["holofoil", "holoFoil", "holo"]
      : finish === "REVERSE"
        ? ["reverseHolofoil", "reverseHolo", "reverse-holofoil", "reverse"]
        : ["normal"];

  if (edition === "FIRST_EDITION") {
    return byFinish.flatMap((k) => [
      `1stEdition${capitalize(k)}`,
      `firstEdition${capitalize(k)}`,
      k,
    ]);
  }
  return byFinish;
}

function capitalize(value: string) {
  return value.length ? `${value[0].toUpperCase()}${value.slice(1)}` : value;
}
