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

type ParsedStructuredQuery = {
  number: number;
  total?: number;
  hasOnlyNumericShape: boolean;
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

function parseCardNumberFromId(id: string): number | undefined {
  // Typical ids look like "base1-4", "swsh3-25", etc.
  const match = id.match(/-(\d+)$/);
  if (!match) return undefined;
  const parsed = Number.parseInt(match[1], 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function parseCardNumberFromLocalId(localId?: string | number): number | undefined {
  if (typeof localId === "number") return localId;
  if (typeof localId !== "string") return undefined;

  // Extract the first numeric run so formats like "004", "4a", "4/102" still map to 4.
  const match = localId.match(/(\d+)/);
  if (!match) return undefined;
  const parsed = Number.parseInt(match[1], 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function parseStructuredCardQuery(query: string): ParsedStructuredQuery | null {
  const q = query.trim();
  if (!q) return null;

  // Pure numeric card query: "4" or "4/102"
  const pureMatch = q.match(/^(\d+)(?:\s*\/\s*(\d+))?$/);
  if (pureMatch) {
    const number = Number.parseInt(pureMatch[1], 10);
    const total =
      pureMatch[2] !== undefined ? Number.parseInt(pureMatch[2], 10) : undefined;
    if (!Number.isFinite(number)) return null;
    return {
      number,
      total: Number.isFinite(total as number) ? total : undefined,
      hasOnlyNumericShape: true,
    };
  }

  // Name + trailing numeric shape: "pikachu 60/64"
  const trailingMatch = q.match(/(\d+)(?:\s*\/\s*(\d+))?\s*$/);
  if (!trailingMatch) return null;

  const number = Number.parseInt(trailingMatch[1], 10);
  const total =
    trailingMatch[2] !== undefined
      ? Number.parseInt(trailingMatch[2], 10)
      : undefined;
  if (!Number.isFinite(number)) return null;

  return {
    number,
    total: Number.isFinite(total as number) ? total : undefined,
    hasOnlyNumericShape: false,
  };
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

    // If the query is just a number or "12/72", capture that too.
    // "60/64" -> pureLocalId: "60/64"
    const pureNumberMatch = q.match(/^(\d+)(?:\s*\/\s*(\d+))?$/);
    const pureNumberPart = pureNumberMatch?.[1];
    const pureTotalPart = pureNumberMatch?.[2];
    const pureFraction =
      pureNumberPart && pureTotalPart
        ? `${pureNumberPart}/${pureTotalPart}`
        : undefined;
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
      // Fallback for sets/cards whose localId may include formatting/leading zeros.
      queries.push(
        Query.create()
          .contains("name", namePart)
          .contains("localId", nameNumberPart)
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
      // Fallback for localId variants like leading zeros/suffixes.
      queries.push(
        Query.create()
          .contains("localId", pureNumberPart)
          .sort("localId", "ASC")
          .paginate(page, pageSize),
      );

      // Fallback by id suffix (e.g. "base1-4") when localId filters are inconsistent.
      queries.push(
        Query.create()
          .contains("id", `-${pureNumberPart}`)
          .sort("id", "ASC")
          .paginate(page, pageSize),
      );

      // If query is a fraction like "4/102", also query the full fraction form
      // directly. Some datasets expose localId with denominator included.
      if (pureFraction) {
        queries.push(
          Query.create()
            .equal("localId", pureFraction)
            .paginate(page, pageSize),
        );
        queries.push(
          Query.create()
            .contains("localId", pureFraction)
            .paginate(page, pageSize),
        );
      }
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
    const maxMerged = pageSize * 8;

    // Round-robin merge so one broad query (e.g. contains localId) doesn't
    // crowd out higher-signal query results.
    let index = 0;
    while (merged.length < maxMerged) {
      let addedAny = false;
      for (const list of resumeArrays) {
        if (index >= list.length) continue;
        const resume = list[index];
        if (!seen.has(resume.id)) {
          seen.add(resume.id);
          merged.push(resume);
          addedAny = true;
          if (merged.length >= maxMerged) break;
        }
      }
      if (!addedAny) break;
      index += 1;
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

      const cardNumber =
        parseCardNumberFromLocalId(card.localId) ??
        parseCardNumberFromId(card.id);

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
    const parsedStructured = parseStructuredCardQuery(q);
    const numericOnlyMode = Boolean(parsedStructured?.hasOnlyNumericShape);
    const nameHint = namePart.toLowerCase();
    const numberHintValue = parsedStructured?.number;
    const desiredTotal = parsedStructured?.total;

    // For pure numeric queries like "60" or "60/64", prefer strict numeric matching.
    // If total is provided (e.g. 60/64), prioritize exact set-total matches.
    if (
      numericOnlyMode &&
      numberHintValue !== undefined &&
      Number.isFinite(numberHintValue)
    ) {
      const normalizedQuery = q.replace(/\s+/g, "");
      const exactFractionMatches = summaries.filter(
        (s) =>
          s.cardNumber !== undefined &&
          s.setTotal !== undefined &&
          `${s.cardNumber}/${s.setTotal}` === normalizedQuery,
      );

      const numberMatches = summaries.filter((s) => s.cardNumber === numberHintValue);

      if (desiredTotal !== undefined && Number.isFinite(desiredTotal)) {
        const exactTotalMatches = numberMatches.filter((s) => s.setTotal === desiredTotal);

        // x/y semantics:
        // - x is card number in set
        // - y is total cards in set
        // For pure numeric fraction queries, return ONLY strict (x,y) matches.
        return [...exactFractionMatches, ...exactTotalMatches]
          .filter((v, i, arr) => arr.findIndex((x) => x.id === v.id) === i)
          .slice(0, pageSize);
      }

      return [...exactFractionMatches, ...numberMatches]
        .filter((v, i, arr) => arr.findIndex((x) => x.id === v.id) === i)
        .slice(0, pageSize);
    }

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

    // Queries above are already paginated by `page`/`pageSize`.
    // At this stage we only need to take the best scored results from this page.
    return scored.slice(0, pageSize).map((s) => s.summary);
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
    let pageResults: PokemonCardSummary[];
    try {
      pageResults = await withTimeout(
        searchPokemonCards(query, page, perPage),
        TCGDEX_TIMEOUT_MS,
      );
    } catch {
      break;
    }
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

const TCGDEX_TIMEOUT_MS = 3_000;
const TCGDEX_COOLDOWN_MS = 30_000;

let circuitOpenUntil = 0;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`TCGdex request timed out after ${ms}ms`)), ms),
    ),
  ]);
}

async function getPokemonCardPricingComparable(
  request: MarketValueRequest,
): Promise<PokemonCardPricingComparables | null> {
  if (Date.now() < circuitOpenUntil) return null;

  try {
    const tcgdex = getTcgDex();
    const card = (await withTimeout(
      tcgdex.card.get(request.cardId) as Promise<TcgDexCardFull>,
      TCGDEX_TIMEOUT_MS,
    )) as TcgDexCardFull;

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
    circuitOpenUntil = Date.now() + TCGDEX_COOLDOWN_MS;
    console.warn("[TCGdex] pricing unavailable, pausing for 30s:", error instanceof Error ? error.message : error);
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
