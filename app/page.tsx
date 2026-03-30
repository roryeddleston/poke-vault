import { DEMO_OWNER_ID } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import type { ReactNode } from "react";
import {
  summarizeValuedHoldings,
  valuePortfolioHoldings,
} from "@/lib/portfolio-valuation";
import { CardImage } from "@/components/CardImage";
import { PageIntro } from "@/components/PageIntro";
import { PageShell } from "@/components/PageShell";
import { SurfaceCard } from "@/components/SurfaceCard";
import {
  FiBarChart2,
  FiDollarSign,
  FiPocket,
  FiTrendingUp,
} from "react-icons/fi";
import { formatGBP, formatPct } from "./portfolio/utils";
import { DashboardAllocationTabs } from "./_components/dashboard-allocation-tabs";

type AllocationRow = {
  label: string;
  value: number;
  pct: number;
};

type PerformerVariant = "best" | "worst";

const PERFORMER_LABEL_STYLES: Record<PerformerVariant, string> = {
  best: "rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-200 dark:text-emerald-800",
  worst:
    "rounded-full bg-rose-100 text-rose-800 dark:bg-rose-200 dark:text-rose-800",
};

const PERFORMER_LABEL_TEXT: Record<PerformerVariant, string> = {
  best: "Best performer",
  worst: "Worst performer",
};

function PerformerLabel({ variant }: { variant: PerformerVariant }) {
  return (
    <p
      className={`inline-flex px-3 py-1 text-xs font-semibold uppercase tracking-[0.04em] ${PERFORMER_LABEL_STYLES[variant]}`}
    >
      {PERFORMER_LABEL_TEXT[variant]}
    </p>
  );
}

type DashboardHolding = {
  cardName: string;
  setName: string;
  grade: string;
  imageUrl?: string | null;
  profit: number;
  profitPct: number;
};

type KpiCardProps = {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "negative";
  icon: ReactNode;
};

function KpiCard({ label, value, tone = "neutral", icon }: KpiCardProps) {
  const valueTone =
    tone === "positive"
      ? "text-accent"
      : tone === "negative"
        ? "text-red-600"
        : "text-text-main";

  return (
    <SurfaceCard as="article" className="relative overflow-hidden p-5">
      <div className="absolute inset-x-0 top-0 h-1 bg-accent/70" />
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-text-muted">
          {label}
        </p>
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle bg-surface text-accent">
          {icon}
        </span>
      </div>
      <p className={`mt-3 text-2xl font-semibold tracking-tight ${valueTone}`}>
        {value}
      </p>
    </SurfaceCard>
  );
}

function PerformerCard({
  variant,
  holding,
}: {
  variant: PerformerVariant;
  holding?: DashboardHolding;
}) {
  return (
    <SurfaceCard as="article" className="min-h-56 p-6">
      <div className="flex items-center justify-between gap-3">
        <PerformerLabel variant={variant} />
        <span className="text-lg font-semibold text-slate-400 dark:text-slate-500">
          Last 30 days
        </span>
      </div>
      {holding ? (
        <div className="mt-4 flex items-start gap-4">
          <CardImage
            src={holding.imageUrl}
            alt={holding.cardName}
            className="h-28 w-20 shrink-0 ring-1 ring-border-subtle"
            sizes="80px"
          />
          <div className="min-w-0 space-y-3.5">
            <p className="truncate text-lg font-semibold text-text-main">
              {holding.cardName}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="inline-flex rounded-full border border-border-subtle bg-surface px-3 py-1.5 font-medium text-text-main">
                {holding.setName}
              </span>
              <span className="inline-flex rounded-full border border-border-subtle bg-surface px-3 py-1.5 text-text-muted">
                {holding.grade}
              </span>
            </div>
            <p className="text-base font-semibold text-text-main">
              <span className={holding.profit >= 0 ? "text-accent" : "text-red-600"}>
                {formatGBP(holding.profit)}
              </span>{" "}
              <span className={holding.profitPct >= 0 ? "text-accent" : "text-red-600"}>
                ({holding.profitPct >= 0 ? "+" : ""}
                {formatPct(holding.profitPct)}%)
              </span>
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-2 text-xs text-text-muted">No data.</p>
      )}
    </SurfaceCard>
  );
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

  const enriched = valued.map((h) => {
    const previous = h.snapshots[1];
    const prevValue = previous ? previous.value * h.quantity : h.invested;
    const value = h.currentValue;
    const changeAmount = value - prevValue;
    const changePct = prevValue === 0 ? 0 : (changeAmount / prevValue) * 100;
    return {
      ...h,
      value,
      changeAmount,
      changePct,
    };
  });

  const summary = summarizeValuedHoldings(valued);

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
    summary.totalValue,
  );
  const allocationByGrade = buildAllocation(
    enriched.map((h) => ({ label: h.grade || "RAW", value: h.value })),
    summary.totalValue,
  );

  return {
    holdingsCount: enriched.length,
    summary,
    bestPerformer,
    worstPerformer,
    recentPriceChanges,
    topMovers,
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
          <p className="text-sm font-medium text-text-main">
            No holdings yet
          </p>
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
                tone="neutral"
                icon={<FiPocket size={16} aria-hidden="true" />}
              />
              <KpiCard
                label="Total cost"
                value={formatGBP(data.summary.totalInvested)}
                tone="neutral"
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
              <article className="shadow-elevation-1 rounded-2xl border border-border-subtle bg-card p-5">
                <p className="text-lg font-semibold tracking-tight text-text-main sm:text-xl">
                  Recent price changes
                </p>
                <ul className="mt-5 divide-y divide-border-subtle/70">
                  {data.recentPriceChanges.map((h) => (
                    <li
                      key={h.id}
                      className="flex items-start justify-between gap-3 py-4"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text-main">
                          {h.cardName}
                        </p>
                        <div className="mt-3 flex items-center gap-2 overflow-hidden text-xs">
                          <span className="truncate rounded-full border border-border-subtle bg-surface px-2 py-0.5 font-medium text-text-main">
                            {h.setName}
                          </span>
                          <span className="truncate rounded-full border border-border-subtle bg-surface px-2 py-0.5 text-text-muted">
                            {h.grade}
                          </span>
                        </div>
                      </div>
                      <p
                        className={`text-sm font-semibold ${
                          h.changeAmount >= 0
                            ? "text-accent"
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
                <ul className="mt-5 divide-y divide-border-subtle/70">
                  {data.topMovers.map((h) => (
                    <li
                      key={h.id}
                      className="flex items-start justify-between gap-3 py-4"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text-main">
                          {h.cardName}
                        </p>
                        <div className="mt-3 flex items-center gap-2 overflow-hidden text-xs">
                          <span className="truncate rounded-full border border-border-subtle bg-surface px-2 py-0.5 font-medium text-text-main">
                            {h.setName}
                          </span>
                          <span className="truncate rounded-full border border-border-subtle bg-surface px-2 py-0.5 text-text-muted">
                            {h.grade}
                          </span>
                        </div>
                      </div>
                      <p
                        className={`text-sm font-semibold ${
                          h.changePct >= 0 ? "text-accent" : "text-red-600"
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
        </>
      )}
    </PageShell>
  );
}
