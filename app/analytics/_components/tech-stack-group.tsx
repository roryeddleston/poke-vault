import type { ReactNode } from "react";
import { SurfaceCard } from "@/components/SurfaceCard";

type TechStackGroupProps = {
  title: string;
  icon?: ReactNode;
  items: Array<{
    label: string;
    icon?: ReactNode;
  }>;
};

export function TechStackGroup({ title, icon, items }: TechStackGroupProps) {
  return (
    <SurfaceCard
      as="article"
      className="relative overflow-hidden border-accent/15 p-6 transition-colors hover:border-accent/30"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-10 h-28 w-28 rounded-full bg-accent-muted/20 blur-2xl"
      />

      <h3 className="flex items-center gap-2 text-sm font-semibold tracking-[0.06em] text-text-main uppercase">
        {icon ? (
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent-muted/25 text-accent">
            {icon}
          </span>
        ) : null}
        {title}
      </h3>

      <div className="mt-5 flex flex-wrap gap-3.5">
        {items.map((item) => (
          <span
            key={item.label}
            className="inline-flex items-center gap-2 rounded-full border border-border-subtle/70 bg-surface px-3 py-1.5 text-xs font-medium text-text-main shadow-sm"
          >
            {item.icon ? (
              <span className="inline-flex text-accent" aria-hidden="true">
                {item.icon}
              </span>
            ) : null}
            {item.label}
          </span>
        ))}
      </div>
    </SurfaceCard>
  );
}
