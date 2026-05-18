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
  title?: string;
};

type TabKey = "set" | "grade";

export function DashboardAllocationTabs({
  bySet,
  byGrade,
  title = "Portfolio allocation",
}: DashboardAllocationTabsProps) {
  const [tab, setTab] = useState<TabKey>("set");

  const rows = useMemo(() => {
    if (tab === "grade") return byGrade;
    return bySet;
  }, [tab, byGrade, bySet]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-lg font-semibold tracking-tight text-text-main sm:text-xl">
          {title}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-text-muted">
            Toggle between set and grade to compare allocation.
          </p>
          <div
            role="tablist"
            aria-label="Allocation dimension"
            className="flex h-9 w-full max-w-44 items-center rounded-full border-2 border-toggle-border bg-card p-0 transition-colors duration-300 hover:border-toggle-border-hover"
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
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-xs text-text-muted">No allocation data yet.</p>
      ) : (
        <ul className="space-y-4">
          {rows.map((row) => {
            return (
              <li
                key={row.label}
                className="space-y-4 rounded-xl border border-accent/25 bg-surface px-4 py-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm leading-7 font-medium text-text-main">
                    {row.label}
                  </p>
                  <p className="text-xs leading-7 font-medium text-text-muted">
                    <span className="text-text-main">
                      {formatGBP(row.value)}
                    </span>{" "}
                    • {row.pct.toFixed(2)}%
                  </p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-soft">
                  <div
                    className="h-full rounded-full bg-accent"
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
      className={`flex-1 rounded-full px-3.5 py-1.5 text-center text-sm whitespace-nowrap font-medium transition-all duration-300 ${
        active
          ? "bg-accent text-gray-900 shadow-sm"
          : "text-text-muted hover:text-text-main"
      }`}
    >
      {label}
    </button>
  );
}
