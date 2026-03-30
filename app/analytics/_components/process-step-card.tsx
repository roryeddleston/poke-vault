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
    <SurfaceCard as="article" className="p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <span className="inline-flex rounded-full border border-border-subtle bg-surface px-2.5 py-1 text-xs font-medium text-text-muted">
          {step}
        </span>
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle bg-surface text-accent">
          {icon}
        </span>
      </div>
      <h3 className="text-base font-semibold text-text-main">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-text-muted">{description}</p>
    </SurfaceCard>
  );
}
