import { DEMO_OWNER_ID } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { formatGBP, formatPct } from "./portfolio/utils";
import { DashboardAllocationTabs } from "./_components/dashboard-allocation-tabs";

type HoldingWithSnapshots = {
  id: string;
  cardName: string;
  setName: string;
  grade: string;
  purchasePrice: number;
  quantity: number;
  snapshots: { value: number; capturedAt: Date }[];
};

type AllocationRow = {
  label: string;
  value: number;
  pct: number;
};

function formatDayLabel(isoDay: string) {
  const date = new Date(`${isoDay}T00:00:00.000Z`);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function buildMiniChart(values: number[]) {
  const width = 700;
  const height = 180;
  const padding = 18;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  if (values.length === 0) {
    return { width, height, linePath: "", areaPath: "" };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values.map((value, index) => {
    const x =
      padding + (index / Math.max(1, values.length - 1)) * chartWidth;
    const normalized = (value - min) / range;
    const y = padding + (1 - normalized) * chartHeight;
    return { x, y };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");

  const first = points[0];
  const last = points[points.length - 1];
  const areaPath = `${linePath} L ${last.x.toFixed(2)} ${(height - padding).toFixed(
    2,
  )} L ${first.x.toFixed(2)} ${(height - padding).toFixed(2)} Z`;

  return { width, height, linePath, areaPath };
}

function buildAllocation(
  rows: Array<{ label: string; value: number }>,
  totalValue: number,
): AllocationRow[] {
  const grouped = new Map<string, number>();
  for (const row of rows) {
    grouped.set(row.label, (grouped.get(row.label) ?? 0) + row.value);
  }
  return Array.from(grouped.entries())
    .map(([label, value]) => ({
      label,
      value,
      pct: totalValue === 0 ? 0 : (value / totalValue) * 100,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
}

async function getDashboardData() {
  const [holdings, snapshots] = await prisma.$transaction([
    prisma.holding.findMany({
      where: { ownerId: DEMO_OWNER_ID },
      include: {
        snapshots: {
          orderBy: { capturedAt: "desc" },
          take: 8,
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.priceSnapshot.findMany({
      where: { ownerId: DEMO_OWNER_ID },
      orderBy: { capturedAt: "asc" },
      include: {
        holding: {
          select: { quantity: true },
        },
      },
    }),
  ]);

  const enriched = (holdings as HoldingWithSnapshots[]).map((h) => {
    const latest = h.snapshots[0];
    const previous = h.snapshots[1];
    const invested = h.purchasePrice * h.quantity;
    const value = latest ? latest.value * h.quantity : invested;
    const profit = value - invested;
    const profitPct = invested === 0 ? 0 : (profit / invested) * 100;
    const prevValue = previous ? previous.value * h.quantity : invested;
    const changeAmount = value - prevValue;
    const changePct = prevValue === 0 ? 0 : (changeAmount / prevValue) * 100;
    return {
      ...h,
      invested,
      value,
      profit,
      profitPct,
      changeAmount,
      changePct,
    };
  });

  const totalInvested = enriched.reduce((sum, h) => sum + h.invested, 0);
  const totalValue = enriched.reduce((sum, h) => sum + h.value, 0);
  const totalProfit = totalValue - totalInvested;
  const profitPercentage =
    totalInvested === 0 ? 0 : (totalProfit / totalInvested) * 100;

  const bestPerformer = [...enriched].sort((a, b) => b.profitPct - a.profitPct)[0];
  const worstPerformer = [...enriched].sort((a, b) => a.profitPct - b.profitPct)[0];
  const topMovers = [...enriched]
    .sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))
    .slice(0, 6);
  const recentPriceChanges = [...enriched]
    .filter((h) => h.snapshots[0])
    .sort(
      (a, b) =>
        b.snapshots[0].capturedAt.getTime() - a.snapshots[0].capturedAt.getTime(),
    )
    .slice(0, 8);

  const allocationBySet = buildAllocation(
    enriched.map((h) => ({ label: h.setName || "Unknown set", value: h.value })),
    totalValue,
  );
  const allocationByGrade = buildAllocation(
    enriched.map((h) => ({ label: h.grade || "RAW", value: h.value })),
    totalValue,
  );
  const seriesMap = new Map<string, number>();
  for (const s of snapshots) {
    const day = s.capturedAt.toISOString().slice(0, 10);
    const qty = s.holding?.quantity ?? 1;
    seriesMap.set(day, (seriesMap.get(day) ?? 0) + s.value * qty);
  }
  const portfolioSeries = Array.from(seriesMap.entries()).map(([day, value]) => ({
    day,
    value,
  }));

  return {
    holdingsCount: enriched.length,
    summary: {
      totalInvested,
      totalValue,
      totalProfit,
      profitPercentage,
    },
    bestPerformer,
    worstPerformer,
    recentPriceChanges,
    topMovers,
    allocationBySet,
    allocationByGrade,
    portfolioSeries,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <main className="min-h-screen bg-page text-text-main px-4 py-8">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <header className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-text-muted">
            Dashboard
          </p>
          <h1 className="text-2xl font-semibold sm:text-3xl">
            Portfolio overview
          </h1>
          <p className="text-sm text-text-muted">
            Data-heavy summary of valuation, allocation, and price momentum.
          </p>
        </header>

        {data.holdingsCount === 0 ? (
          <section className="rounded-xl border border-border-subtle bg-card px-6 py-12 text-center">
            <p className="text-sm font-medium text-text-main">No holdings yet</p>
            <p className="mt-2 text-sm text-text-muted">
              Add cards from Market to populate your dashboard widgets.
            </p>
          </section>
        ) : (
          <>
            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
              <article className="rounded-xl border border-border-subtle bg-card p-4">
                <p className="text-xs text-text-muted">Total portfolio value</p>
                <p className="mt-1 text-xl font-semibold">
                  {formatGBP(data.summary.totalValue)}
                </p>
              </article>
              <article className="rounded-xl border border-border-subtle bg-card p-4">
                <p className="text-xs text-text-muted">Total cost basis</p>
                <p className="mt-1 text-xl font-semibold">
                  {formatGBP(data.summary.totalInvested)}
                </p>
              </article>
              <article className="rounded-xl border border-border-subtle bg-card p-4">
                <p className="text-xs text-text-muted">Profit / loss</p>
                <p
                  className={`mt-1 text-xl font-semibold ${
                    data.summary.totalProfit >= 0 ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {formatGBP(data.summary.totalProfit)}
                </p>
              </article>
              <article className="rounded-xl border border-border-subtle bg-card p-4">
                <p className="text-xs text-text-muted">Return</p>
                <p className="mt-1 text-xl font-semibold text-emerald-600">
                  {formatPct(data.summary.profitPercentage)}%
                </p>
              </article>
            </section>

            <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <article className="rounded-xl border border-border-subtle bg-card p-4">
                <p className="text-xs text-text-muted">Best performer</p>
                {data.bestPerformer ? (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-text-main">
                      {data.bestPerformer.cardName}
                    </p>
                    <p className="text-xs text-text-muted">
                      {data.bestPerformer.setName} • {data.bestPerformer.grade}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-emerald-600">
                      {formatGBP(data.bestPerformer.profit)} (
                      {formatPct(data.bestPerformer.profitPct)}%)
                    </p>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-text-muted">No data.</p>
                )}
              </article>
              <article className="rounded-xl border border-border-subtle bg-card p-4">
                <p className="text-xs text-text-muted">Worst performer</p>
                {data.worstPerformer ? (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-text-main">
                      {data.worstPerformer.cardName}
                    </p>
                    <p className="text-xs text-text-muted">
                      {data.worstPerformer.setName} • {data.worstPerformer.grade}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-red-600">
                      {formatGBP(data.worstPerformer.profit)} (
                      {formatPct(data.worstPerformer.profitPct)}%)
                    </p>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-text-muted">No data.</p>
                )}
              </article>
            </section>

            <section className="rounded-xl border border-border-subtle bg-card p-4">
              <p className="text-xs text-text-muted">
                Portfolio allocation by set / grade
              </p>
              <div className="mt-3">
                <DashboardAllocationTabs
                  bySet={data.allocationBySet}
                  byGrade={data.allocationByGrade}
                />
              </div>
            </section>

            <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <article className="rounded-xl border border-border-subtle bg-card p-4">
                <p className="text-xs text-text-muted">Recent price changes</p>
                <ul className="mt-3 space-y-2">
                  {data.recentPriceChanges.map((h) => (
                    <li key={h.id} className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text-main">
                          {h.cardName}
                        </p>
                        <p className="truncate text-xs text-text-muted">
                          {h.setName} • {h.grade}
                        </p>
                      </div>
                      <p
                        className={`text-xs font-semibold ${
                          h.changeAmount >= 0 ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {h.changeAmount >= 0 ? "+" : ""}
                        {formatGBP(h.changeAmount)}
                      </p>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="rounded-xl border border-border-subtle bg-card p-4">
                <p className="text-xs text-text-muted">Top movers</p>
                <ul className="mt-3 space-y-2">
                  {data.topMovers.map((h) => (
                    <li key={h.id} className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text-main">
                          {h.cardName}
                        </p>
                        <p className="truncate text-xs text-text-muted">
                          {h.setName} • {h.grade}
                        </p>
                      </div>
                      <p
                        className={`text-xs font-semibold ${
                          h.changePct >= 0 ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {h.changePct >= 0 ? "+" : ""}
                        {formatPct(h.changePct)}%
                      </p>
                    </li>
                  ))}
                </ul>
              </article>
            </section>

            <section className="rounded-xl border border-border-subtle bg-card p-4">
              <p className="text-xs text-text-muted">
                Mini chart of portfolio value over time
              </p>
              {data.portfolioSeries.length === 0 ? (
                <p className="mt-3 text-xs text-text-muted">No historical data yet.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {(() => {
                    const values = data.portfolioSeries.map((x) => x.value);
                    const { width, height, linePath, areaPath } =
                      buildMiniChart(values);
                    const first = data.portfolioSeries[0];
                    const last =
                      data.portfolioSeries[data.portfolioSeries.length - 1];
                    return (
                      <>
                        <div className="h-40 w-full rounded-lg border border-border-subtle bg-surface-soft/50 p-2">
                          <svg
                            viewBox={`0 0 ${width} ${height}`}
                            className="h-full w-full"
                            role="img"
                            aria-label="Portfolio value trend chart"
                          >
                            <defs>
                              <linearGradient
                                id="portfolio-area"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="0%"
                                  stopColor="var(--accent)"
                                  stopOpacity="0.35"
                                />
                                <stop
                                  offset="100%"
                                  stopColor="var(--accent)"
                                  stopOpacity="0.04"
                                />
                              </linearGradient>
                            </defs>
                            <path
                              d={areaPath}
                              fill="url(#portfolio-area)"
                            />
                            <path
                              d={linePath}
                              fill="none"
                              stroke="var(--accent)"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-text-muted">
                          <span>{formatDayLabel(first.day)} · {formatGBP(first.value)}</span>
                          <span>{formatDayLabel(last.day)} · {formatGBP(last.value)}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
