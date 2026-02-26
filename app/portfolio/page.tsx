import { headers } from "next/headers";

type Holding = {
  id: string;
  cardId: string;
  cardName: string;
  setName: string;
  grade: string;
  purchasePrice: number;
  quantity: number;
  snapshots: Array<{ value: number; capturedAt: string }>;
};

type PortfolioResponse = {
  holdings: Holding[];
  summary: {
    totalInvested: number;
    totalValue: number;
    totalProfit: number;
    profitPercentage: number;
  };
};

function formatGBP(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPct(value: number) {
  return new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

async function getPortfolio(): Promise<PortfolioResponse> {
  // Server-side fetch to your own API route.
  // Use the current host so this works locally + on Vercel.
  const h = await headers();
  const host = h.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  const res = await fetch(`${protocol}://${host}/api/portfolio`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to load portfolio");

  return res.json();
}

export default async function PortfolioPage() {
  const data = await getPortfolio();

  return (
    <main className="min-h-screen bg-page text-text-main px-4 py-8">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <header className="flex items-baseline justify-between gap-4">
          <h1 className="text-2xl font-semibold">Portfolio</h1>
          <p className="text-sm text-text-muted">
            Demo data • server-rendered
          </p>
        </header>

        {/* Summary */}
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-border-subtle bg-card p-4">
            <p className="text-xs text-text-muted">Invested</p>
            <p className="mt-1 text-lg font-semibold">
              {formatGBP(data.summary.totalInvested)}
            </p>
          </div>

          <div className="rounded-lg border border-border-subtle bg-card p-4">
            <p className="text-xs text-text-muted">Value</p>
            <p className="mt-1 text-lg font-semibold">
              {formatGBP(data.summary.totalValue)}
            </p>
          </div>

          <div className="rounded-lg border border-border-subtle bg-card p-4">
            <p className="text-xs text-text-muted">Profit</p>
            <p className="mt-1 text-lg font-semibold">
              {formatGBP(data.summary.totalProfit)}
            </p>
          </div>

          <div className="rounded-lg border border-border-subtle bg-card p-4">
            <p className="text-xs text-text-muted">Profit %</p>
            <p className="mt-1 text-lg font-semibold">
              {formatPct(data.summary.profitPercentage)}%
            </p>
          </div>
        </section>

        {/* Table */}
        <section className="overflow-hidden rounded-lg border border-border-subtle bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border-subtle text-left">
                <tr className="text-text-muted">
                  <th className="px-4 py-3 font-medium">Card</th>
                  <th className="px-4 py-3 font-medium">Set</th>
                  <th className="px-4 py-3 font-medium">Grade</th>
                  <th className="px-4 py-3 font-medium">Qty</th>
                  <th className="px-4 py-3 font-medium">Buy</th>
                  <th className="px-4 py-3 font-medium">Latest</th>
                </tr>
              </thead>
              <tbody>
                {data.holdings.map((h) => {
                  const latest = h.snapshots[0]?.value ?? h.purchasePrice;
                  return (
                    <tr
                      key={h.id}
                      className="border-b border-border-subtle last:border-b-0"
                    >
                      <td className="px-4 py-3 font-medium">{h.cardName}</td>
                      <td className="px-4 py-3">{h.setName}</td>
                      <td className="px-4 py-3">{h.grade}</td>
                      <td className="px-4 py-3">{h.quantity}</td>
                      <td className="px-4 py-3">
                        {formatGBP(h.purchasePrice)}
                      </td>
                      <td className="px-4 py-3">{formatGBP(latest)}</td>
                    </tr>
                  );
                })}

                {data.holdings.length === 0 ? (
                  <tr>
                    <td
                      className="px-4 py-8 text-center text-text-muted"
                      colSpan={6}
                    >
                      No holdings yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
