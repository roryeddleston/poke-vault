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
      className="relative overflow-hidden border-accent/15 p-7 transition-colors hover:border-accent/30 sm:p-8"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-10 h-36 w-36 rounded-full bg-accent-muted/20 blur-2xl"
      />

      <h3 className="flex items-center gap-3 text-base font-semibold tracking-[0.05em] text-text-main uppercase">
        {icon ? (
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border-subtle bg-surface text-accent shadow-sm sm:h-12 sm:w-12">
            {icon}
          </span>
        ) : null}
        {title}
      </h3>

      <div className="mt-6 flex flex-wrap gap-4 sm:mt-7 sm:gap-5">
        {items.map((item) => (
          <span
            key={item.label}
            className="inline-flex items-center gap-2.5 rounded-full border border-border-subtle/70 bg-surface px-4 py-2 text-sm font-medium text-text-main shadow-sm"
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
