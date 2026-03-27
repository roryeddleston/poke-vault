import { DEMO_OWNER_ID } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { CardImage } from "@/components/CardImage";
import { formatGBP, formatPct } from "./portfolio/utils";
import { DashboardAllocationTabs } from "./_components/dashboard-allocation-tabs";

type HoldingWithSnapshots = {
  id: string;
  cardName: string;
  setName: string;
  grade: string;
  imageUrl?: string | null;
  purchasePrice: number;
  quantity: number;
  snapshots: { value: number; capturedAt: Date }[];
};

type AllocationRow = {
  label: string;
  value: number;
  pct: number;
};

type PerformerVariant = "best" | "worst";

const PERFORMER_LABEL_STYLES: Record<PerformerVariant, string> = {
  best: "border border-border-subtle bg-surface text-[#065f46] dark:text-[#34d399]",
  worst:
    "border border-border-subtle bg-surface text-[#991b1b] dark:text-[#f87171]",
};

const PERFORMER_LABEL_TEXT: Record<PerformerVariant, string> = {
  best: "Best performer",
  worst: "Worst performer",
};

function PerformerLabel({ variant }: { variant: PerformerVariant }) {
  return (
    <p
      className={`inline-flex rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] ${PERFORMER_LABEL_STYLES[variant]}`}
    >
      {PERFORMER_LABEL_TEXT[variant]}
    </p>
  );
}

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
    const x = padding + (index / Math.max(1, values.length - 1)) * chartWidth;
    const normalized = (value - min) / range;
    const y = padding + (1 - normalized) * chartHeight;
    return { x, y };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");

  const first = points[0];
  const last = points[points.length - 1];
  const areaPath = `${linePath} L ${last.x.toFixed(2)} ${(
    height - padding
  ).toFixed(2)} L ${first.x.toFixed(2)} ${(height - padding).toFixed(2)} Z`;

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
  const [holdings, snapshots] = await Promise.all([
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

  const bestPerformer = [...enriched].sort(
    (a, b) => b.profitPct - a.profitPct,
  )[0];
  const worstPerformer = [...enriched].sort(
    (a, b) => a.profitPct - b.profitPct,
  )[0];
  const topMovers = [...enriched]
    .sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))
    .slice(0, 5);
  const recentPriceChanges = [...enriched]
    .filter((h) => h.snapshots[0])
    .sort(
      (a, b) =>
        b.snapshots[0].capturedAt.getTime() -
        a.snapshots[0].capturedAt.getTime(),
    )
    .slice(0, 5);

  const allocationBySet = buildAllocation(
    enriched.map((h) => ({
      label: h.setName || "Unknown set",
      value: h.value,
    })),
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
  const portfolioSeries = Array.from(seriesMap.entries()).map(
    ([day, value]) => ({
      day,
      value,
    }),
  );

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
    <main className="min-h-screen bg-page px-4 py-7 text-text-main md:px-8 lg:px-10">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold sm:text-3xl">
            Portfolio overview
          </h1>
          <p className="text-sm text-text-muted">
            Summary of valuation, allocation, and price momentum
          </p>
        </header>

        {data.holdingsCount === 0 ? (
          <section className="shadow-elevation-1 rounded-2xl border border-border-subtle bg-card px-6 py-12 text-center">
            <p className="text-sm font-medium text-text-main">
              No holdings yet
            </p>
            <p className="mt-2 text-sm text-text-muted">
              Add cards from Market to populate your dashboard widgets.
            </p>
          </section>
        ) : (
          <>
            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <article className="shadow-elevation-1 rounded-2xl border border-border-subtle bg-card p-5">
                <p className="text-xs text-text-muted">Total portfolio value</p>
                <p className="mt-1 text-xl font-semibold">
                  {formatGBP(data.summary.totalValue)}
                </p>
              </article>
              <article className="shadow-elevation-1 rounded-2xl border border-border-subtle bg-card p-5">
                <p className="text-xs text-text-muted">Total cost</p>
                <p className="mt-1 text-xl font-semibold">
                  {formatGBP(data.summary.totalInvested)}
                </p>
              </article>
              <article className="shadow-elevation-1 rounded-2xl border border-border-subtle bg-card p-5">
                <p className="text-xs text-text-muted">Profit / loss</p>
                <p
                  className={`mt-1 text-xl font-semibold ${
                    data.summary.totalProfit >= 0
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {formatGBP(data.summary.totalProfit)}
                </p>
              </article>
              <article className="shadow-elevation-1 rounded-2xl border border-border-subtle bg-card p-5">
                <p className="text-xs text-text-muted">Return</p>
                <p className="mt-1 text-xl font-semibold text-emerald-600">
                  {formatPct(data.summary.profitPercentage)}%
                </p>
              </article>
            </section>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <article className="shadow-elevation-1 min-h-56 rounded-2xl border border-border-subtle bg-card p-6">
                <div className="flex items-center justify-between gap-3">
                  <PerformerLabel variant="best" />
                  <span className="text-lg font-semibold text-slate-400 dark:text-slate-500">
                    Last 30 days
                  </span>
                </div>
                {data.bestPerformer ? (
                  <div className="mt-4 flex items-start gap-4">
                    <CardImage
                      src={data.bestPerformer.imageUrl}
                      alt={data.bestPerformer.cardName}
                      className="h-28 w-20 shrink-0 ring-1 ring-border-subtle"
                      sizes="80px"
                    />
                    <div className="min-w-0 space-y-3.5">
                      <p className="truncate text-lg font-semibold text-text-main">
                        {data.bestPerformer.cardName}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="inline-flex rounded-full border border-border-subtle bg-surface px-3 py-1.5 font-medium text-text-main">
                          {data.bestPerformer.setName}
                        </span>
                        <span className="inline-flex rounded-full border border-border-subtle bg-surface px-3 py-1.5 text-text-muted">
                          {data.bestPerformer.grade}
                        </span>
                      </div>
                      <p className="text-base font-semibold text-text-main">
                        {formatGBP(data.bestPerformer.profit)} (
                        {formatPct(data.bestPerformer.profitPct)}%)
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-text-muted">No data.</p>
                )}
              </article>
              <article className="shadow-elevation-1 min-h-56 rounded-2xl border border-border-subtle bg-card p-6">
                <div className="flex items-center justify-between gap-3">
                  <PerformerLabel variant="worst" />
                  <span className="text-lg font-semibold text-slate-400 dark:text-slate-500">
                    Last 30 days
                  </span>
                </div>
                {data.worstPerformer ? (
                  <div className="mt-4 flex items-start gap-4">
                    <CardImage
                      src={data.worstPerformer.imageUrl}
                      alt={data.worstPerformer.cardName}
                      className="h-28 w-20 shrink-0 ring-1 ring-border-subtle"
                      sizes="80px"
                    />
                    <div className="min-w-0 space-y-3.5">
                      <p className="truncate text-lg font-semibold text-text-main">
                        {data.worstPerformer.cardName}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="inline-flex rounded-full border border-border-subtle bg-surface px-3 py-1.5 font-medium text-text-main">
                          {data.worstPerformer.setName}
                        </span>
                        <span className="inline-flex rounded-full border border-border-subtle bg-surface px-3 py-1.5 text-text-muted">
                          {data.worstPerformer.grade}
                        </span>
                      </div>
                      <p className="text-base font-semibold text-text-main">
                        {formatGBP(data.worstPerformer.profit)} (
                        {formatPct(data.worstPerformer.profitPct)}%)
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-text-muted">No data.</p>
                )}
              </article>
            </section>

            <section className="shadow-elevation-1 rounded-2xl border border-border-subtle bg-card p-5">
              <p className="text-lg font-semibold tracking-tight text-text-main sm:text-xl">
                Portfolio allocation by set / grade
              </p>
              <div className="mt-4">
                <DashboardAllocationTabs
                  bySet={data.allocationBySet}
                  byGrade={data.allocationByGrade}
                />
              </div>
            </section>

            <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <article className="shadow-elevation-1 rounded-2xl border border-border-subtle bg-card p-5">
                <p className="text-lg font-semibold tracking-tight text-text-main sm:text-xl">
                  Recent price changes
                </p>
                <ul className="mt-4 divide-y divide-border-subtle/70">
                  {data.recentPriceChanges.map((h) => (
                    <li
                      key={h.id}
                      className="flex items-start justify-between gap-2 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text-main">
                          {h.cardName}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5 overflow-hidden text-xs">
                          <span className="truncate rounded-full border border-border-subtle bg-surface px-2 py-0.5 font-medium text-text-main">
                            {h.setName}
                          </span>
                          <span className="truncate rounded-full border border-border-subtle bg-surface px-2 py-0.5 text-text-muted">
                            {h.grade}
                          </span>
                        </div>
                      </div>
                      <p
                        className={`text-xs font-semibold ${
                          h.changeAmount >= 0
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {h.changeAmount >= 0 ? "+" : ""}
                        {formatGBP(h.changeAmount)}
                      </p>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="shadow-elevation-1 rounded-2xl border border-border-subtle bg-card p-5">
                <p className="text-lg font-semibold tracking-tight text-text-main sm:text-xl">
                  Top movers
                </p>
                <ul className="mt-4 divide-y divide-border-subtle/70">
                  {data.topMovers.map((h) => (
                    <li
                      key={h.id}
                      className="flex items-start justify-between gap-2 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text-main">
                          {h.cardName}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5 overflow-hidden text-xs">
                          <span className="truncate rounded-full border border-border-subtle bg-surface px-2 py-0.5 font-medium text-text-main">
                            {h.setName}
                          </span>
                          <span className="truncate rounded-full border border-border-subtle bg-surface px-2 py-0.5 text-text-muted">
                            {h.grade}
                          </span>
                        </div>
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

            <section className="shadow-elevation-1 rounded-2xl border border-border-subtle bg-card p-5">
              <p className="text-lg font-semibold tracking-tight text-text-main sm:text-xl">
                Mini chart of portfolio value over time
              </p>
              {data.portfolioSeries.length === 0 ? (
                <p className="mt-3 text-xs text-text-muted">
                  No historical data yet.
                </p>
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
                            <path d={areaPath} fill="url(#portfolio-area)" />
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
                          <span>
                            {formatDayLabel(first.day)} ·{" "}
                            {formatGBP(first.value)}
                          </span>
                          <span>
                            {formatDayLabel(last.day)} · {formatGBP(last.value)}
                          </span>
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
