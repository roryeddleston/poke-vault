import type { ReactNode } from "react";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import { CardImage } from "@/components/CardImage";
import { SurfaceCard } from "@/components/SurfaceCard";
import { formatGBP, formatPct } from "../portfolio/utils";

type PerformerVariant = "best" | "worst";

export type PerformerHolding = {
  cardName: string;
  setName: string;
  grade: string;
  imageUrl?: string | null;
  profit: number;
  profitPct: number;
};

const PERFORMER_CONFIG: Record<
  PerformerVariant,
  { label: string; icon: ReactNode; className: string }
> = {
  best: {
    label: "Best performer",
    icon: <FiTrendingUp size={11} />,
    className: "border border-teal-500 text-teal-600 dark:border-teal-500 dark:text-teal-400",
  },
  worst: {
    label: "Worst performer",
    icon: <FiTrendingDown size={11} />,
    className: "border border-rose-400 text-rose-600 dark:border-rose-400 dark:text-rose-400",
  },
};

function PerformerLabel({ variant }: { variant: PerformerVariant }) {
  const { label, icon, className } = PERFORMER_CONFIG[variant];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${className}`}
    >
      {icon}
      {label}
    </span>
  );
}

export function PerformerCard({
  variant,
  holding,
}: {
  variant: PerformerVariant;
  holding?: PerformerHolding;
}) {
  return (
    <SurfaceCard as="article" className="min-h-56 p-6">
      <div className="flex items-center justify-between gap-3">
        <PerformerLabel variant={variant} />
        <span className="text-lg font-semibold text-text-muted">Last 30 days</span>
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
              <span className={holding.profit >= 0 ? "text-text-positive" : "text-danger"}>
                {formatGBP(holding.profit)}
              </span>{" "}
              <span className={holding.profitPct >= 0 ? "text-text-positive" : "text-danger"}>
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
