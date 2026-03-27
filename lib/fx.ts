import "server-only";

type SupportedCurrency = "GBP" | "EUR" | "USD";

type FxRates = {
  base: "GBP";
  gbpPer: Record<SupportedCurrency, number>;
  fetchedAt: number;
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

let cached: FxRates | null = null;

async function fetchGbpRates(): Promise<FxRates> {
  // Frankfurter uses ECB reference rates (no API key).
  const res = await fetch(
    "https://api.frankfurter.app/latest?from=GBP&to=EUR,USD,GBP",
    { next: { revalidate: 60 * 60 } }, // cache for 1h at the fetch layer
  );
  if (!res.ok) {
    throw new Error(`FX fetch failed: ${res.status}`);
  }
  const data = (await res.json()) as {
    base: string;
    rates: Record<string, number>;
  };

  const gbpPer: FxRates["gbpPer"] = {
    GBP: 1,
    EUR: typeof data.rates.EUR === "number" ? 1 / data.rates.EUR : NaN,
    USD: typeof data.rates.USD === "number" ? 1 / data.rates.USD : NaN,
  };

  if (!Number.isFinite(gbpPer.EUR) || !Number.isFinite(gbpPer.USD)) {
    throw new Error("FX rates missing or invalid");
  }

  return { base: "GBP", gbpPer, fetchedAt: Date.now() };
}

async function getRates(): Promise<FxRates> {
  if (cached && Date.now() - cached.fetchedAt < ONE_DAY_MS) return cached;
  cached = await fetchGbpRates();
  return cached;
}

export async function convertToGbp(
  amount: number,
  currency: string,
): Promise<number | null> {
  if (!Number.isFinite(amount)) return null;
  const cur = currency.toUpperCase();
  if (cur === "GBP") return amount;
  if (cur !== "EUR" && cur !== "USD") return null;

  const rates = await getRates();
  const factor = rates.gbpPer[cur];
  return amount * factor;
}

