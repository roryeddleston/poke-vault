import type { ReactNode } from "react";
import { SurfaceCard } from "@/components/SurfaceCard";

type KpiCardProps = {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "negative";
  icon: ReactNode;
};

export function KpiCard({ label, value, tone = "neutral", icon }: KpiCardProps) {
  const valueTone =
    tone === "positive"
      ? "text-text-positive"
      : tone === "negative"
        ? "text-danger"
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
