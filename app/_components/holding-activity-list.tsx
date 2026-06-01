import type { ReactNode } from "react";

export type ActivityItem = {
  id: string;
  cardName: string;
  setName: string;
  grade: string;
  displayValue: string;
  positive: boolean;
};

type HoldingActivityListProps = {
  title: string;
  icon: ReactNode;
  items: ActivityItem[];
};

export function HoldingActivityList({ title, icon, items }: HoldingActivityListProps) {
  return (
    <article className="shadow-elevation-1 rounded-2xl border border-border-subtle bg-card p-5">
      <div className="-mx-5 border-b-2 border-accent/35 px-5 pb-4">
        <div className="flex items-center gap-2.5">
          {icon}
          <p className="text-lg font-semibold tracking-tight text-text-main sm:text-xl">
            {title}
          </p>
        </div>
      </div>
      <ul className="mt-3 divide-y divide-border-subtle/70">
        {items.map((h) => (
          <li
            key={h.id}
            className="flex items-start justify-between gap-3 py-4 first:pt-2 last:pb-2"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-text-main">{h.cardName}</p>
              <div className="mt-3 flex items-center gap-2 overflow-hidden text-xs">
                <span className="truncate rounded-full border border-border-subtle bg-surface px-2 py-0.5 font-medium text-text-main">
                  {h.setName}
                </span>
                <span className="truncate rounded-full border border-border-subtle bg-surface px-2 py-0.5 text-text-muted">
                  {h.grade}
                </span>
              </div>
            </div>
            <p className={`text-sm font-semibold ${h.positive ? "text-text-positive" : "text-danger"}`}>
              {h.displayValue}
            </p>
          </li>
        ))}
      </ul>
    </article>
  );
}
