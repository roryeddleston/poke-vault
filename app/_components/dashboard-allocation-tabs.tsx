"use client";

import { useMemo, useState } from "react";
import { formatGBP } from "../portfolio/utils";

type AllocationRow = {
  label: string;
  value: number;
  pct: number;
};

type DashboardAllocationTabsProps = {
  bySet: AllocationRow[];
  byGrade: AllocationRow[];
};

type TabKey = "set" | "grade";

export function DashboardAllocationTabs({
  bySet,
  byGrade,
}: DashboardAllocationTabsProps) {
  const [tab, setTab] = useState<TabKey>("set");

  const rows = useMemo(() => {
    if (tab === "grade") return byGrade;
    return bySet;
  }, [tab, byGrade, bySet]);

  return (
    <div className="space-y-3">
      <div
        role="tablist"
        aria-label="Allocation dimension"
        className="inline-flex max-w-full overflow-x-auto rounded-full border border-border-subtle bg-surface p-1 text-xs"
      >
        <TabButton
          id="set"
          active={tab === "set"}
          label="Set"
          onClick={() => setTab("set")}
        />
        <TabButton
          id="grade"
          active={tab === "grade"}
          label="Grade"
          onClick={() => setTab("grade")}
        />
      </div>

      {rows.length === 0 ? (
        <p className="text-xs text-text-muted">No allocation data yet.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => {
            return (
              <li
                key={row.label}
                className="space-y-2 rounded-lg border border-border-subtle bg-surface-soft/40 px-3 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate rounded-full border border-border-subtle bg-surface px-2 py-0.5 text-xs font-medium text-text-main">
                    {row.label}
                  </p>
                  <p className="text-[11px] text-text-muted">
                    {formatGBP(row.value)} • {row.pct.toFixed(2)}%
                  </p>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-surface-soft">
                  <div
                    className="h-full rounded-full bg-accent-soft"
                    style={{ width: `${Math.min(100, row.pct)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

type TabButtonProps = {
  id: string;
  active: boolean;
  label: string;
  onClick: () => void;
};

function TabButton({ id, active, label, onClick }: TabButtonProps) {
  return (
    <button
      role="tab"
      id={`allocation-tab-${id}`}
      aria-selected={active}
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 whitespace-nowrap transition-colors ${
        active
          ? "bg-card text-text-main shadow-sm hover:bg-surface-soft"
          : "text-text-muted hover:bg-card hover:text-text-main"
      }`}
    >
      {label}
    </button>
  );
}
