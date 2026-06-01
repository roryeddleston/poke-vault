import { DEMO_OWNER_ID } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import {
  summarizeValuedHoldings,
  valuePortfolioHoldings,
} from "@/lib/portfolio-valuation";
import { PageIntro } from "@/components/PageIntro";
import { PageShell } from "@/components/PageShell";
import {
  FiActivity,
  FiBarChart2,
  FiDollarSign,
  FiPocket,
  FiTrendingUp,
} from "react-icons/fi";
import { formatGBP, formatPct } from "./portfolio/utils";
import { DashboardAllocationTabs } from "./_components/dashboard-allocation-tabs";
import { KpiCard } from "./_components/kpi-card";
import { PerformerCard } from "./_components/performer-card";
import { HoldingActivityList, type ActivityItem } from "./_components/holding-activity-list";

export const dynamic = "force-dynamic";

type AllocationRow = {
  label: string;
  value: number;
  pct: number;
};

type EnrichedHolding = {
  id: string;
  cardName: string;
  setName: string;
  grade: string;
  imageUrl?: string | null;
  profit: number;
  profitPct: number;
  currentValue: number;
  changeAmount: number;
  changePct: number;
  latestSnapshotAt: Date | null;
};

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

function toActivityItem(
  h: EnrichedHolding,
  mode: "change" | "movers",
): ActivityItem {
  const isPositive = mode === "change" ? h.changeAmount >= 0 : h.changePct >= 0;
  const displayValue =
    mode === "change"
      ? `${h.changeAmount >= 0 ? "+" : ""}${formatGBP(h.changeAmount)}`
      : `${h.changePct >= 0 ? "+" : ""}${formatPct(h.changePct)}%`;
  return {
    id: h.id,
    cardName: h.cardName,
    setName: h.setName,
    grade: h.grade,
    displayValue,
    positive: isPositive,
  };
}

async function getDashboardData() {
  const holdings = await prisma.holding.findMany({
    where: { ownerId: DEMO_OWNER_ID },
    include: {
      snapshots: {
        orderBy: { capturedAt: "desc" },
        take: 8,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const valued = await valuePortfolioHoldings(holdings);

  const enriched: EnrichedHolding[] = valued.map((h) => {
    const previous = h.snapshots[1];
    const prevValue = previous ? previous.value * h.quantity : h.invested;
    const changeAmount = h.currentValue - prevValue;
    const changePct = prevValue === 0 ? 0 : (changeAmount / prevValue) * 100;
    return {
      id: h.id,
      cardName: h.cardName,
      setName: h.setName,
      grade: h.grade,
      imageUrl: h.imageUrl,
      profit: h.profit,
      profitPct: h.profitPct,
      currentValue: h.currentValue,
      changeAmount,
      changePct,
      latestSnapshotAt: h.snapshots[0]?.capturedAt ?? null,
    };
  });

  const summary = summarizeValuedHoldings(valued);

  const byProfitPct = [...enriched].sort((a, b) => b.profitPct - a.profitPct);
  const topMovers = [...enriched]
    .sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))
    .slice(0, 5);
  const recentPriceChanges = enriched
    .filter((h) => h.latestSnapshotAt !== null)
    .sort((a, b) => (b.latestSnapshotAt?.getTime() ?? 0) - (a.latestSnapshotAt?.getTime() ?? 0))
    .slice(0, 5);

  const allocationBySet = buildAllocation(
    enriched.map((h) => ({ label: h.setName || "Unknown set", value: h.currentValue })),
    summary.totalValue,
  );
  const allocationByGrade = buildAllocation(
    enriched.map((h) => ({ label: h.grade || "RAW", value: h.currentValue })),
    summary.totalValue,
  );

  return {
    holdingsCount: enriched.length,
    summary,
    bestPerformer: byProfitPct[0],
    worstPerformer: byProfitPct[byProfitPct.length - 1],
    recentPriceChanges: recentPriceChanges.map((h) => toActivityItem(h, "change")),
    topMovers: topMovers.map((h) => toActivityItem(h, "movers")),
    allocationBySet,
    allocationByGrade,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <PageShell>
      <PageIntro
        title="Portfolio overview"
        subtitle="Summary of valuation, allocation, and price momentum"
      />

      {data.holdingsCount === 0 ? (
        <section className="shadow-elevation-1 rounded-2xl border border-border-subtle bg-card px-6 py-12 text-center">
          <p className="text-sm font-medium text-text-main">No holdings yet</p>
          <p className="mt-2 text-sm text-text-muted">
            Add cards from Search to populate your dashboard widgets.
          </p>
        </section>
      ) : (
        <>
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              label="Total portfolio value"
              value={formatGBP(data.summary.totalValue)}
              icon={<FiPocket size={16} aria-hidden="true" />}
            />
            <KpiCard
              label="Total cost"
              value={formatGBP(data.summary.totalInvested)}
              icon={<FiDollarSign size={16} aria-hidden="true" />}
            />
            <KpiCard
              label="Profit / loss"
              value={formatGBP(data.summary.totalProfit)}
              tone={data.summary.totalProfit >= 0 ? "positive" : "negative"}
              icon={<FiTrendingUp size={16} aria-hidden="true" />}
            />
            <KpiCard
              label="Return"
              value={`${formatPct(data.summary.profitPercentage)}%`}
              tone="positive"
              icon={<FiBarChart2 size={16} aria-hidden="true" />}
            />
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <PerformerCard variant="best" holding={data.bestPerformer} />
            <PerformerCard variant="worst" holding={data.worstPerformer} />
          </section>

          <section className="shadow-elevation-1 rounded-2xl border border-border-subtle bg-card p-5">
            <DashboardAllocationTabs
              bySet={data.allocationBySet}
              byGrade={data.allocationByGrade}
            />
          </section>

          <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <HoldingActivityList
              title="Recent price changes"
              icon={<FiActivity className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />}
              items={data.recentPriceChanges}
            />
            <HoldingActivityList
              title="Top movers"
              icon={<FiTrendingUp className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />}
              items={data.topMovers}
            />
          </section>
        </>
      )}
    </PageShell>
  );
}
