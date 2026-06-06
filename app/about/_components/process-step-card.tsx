"use client";

import type { ReactNode } from "react";
import { SurfaceCard } from "@/components/SurfaceCard";

type ProcessStepCardProps = {
  step: string;
  title: string;
  description: string;
  icon: ReactNode;
};

export function ProcessStepCard({
  step,
  title,
  description,
  icon,
}: ProcessStepCardProps) {
  return (
    <SurfaceCard as="article" className="relative overflow-hidden p-5 transition-colors hover:border-accent/30">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-accent-muted/20 blur-2xl"
      />

      <div className="relative">
        <div className="mb-4 flex items-start justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent-muted/20 px-3 py-1 text-xs font-semibold text-text-positive">
            {step}
          </span>

          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-accent/25 bg-accent-muted/30 text-accent shadow-sm">
            {icon}
          </span>
        </div>

        <h3 className="text-base font-semibold text-text-main">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-text-muted">{description}</p>

        <div aria-hidden="true" className="mt-5 h-px w-full bg-accent/20" />
      </div>
    </SurfaceCard>
  );
}
