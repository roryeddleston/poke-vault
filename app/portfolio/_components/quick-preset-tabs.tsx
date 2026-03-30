"use client";

import type { QuickPreset } from "../utils";

type QuickPresetTabsProps = {
  active: QuickPreset;
  onChange: (preset: QuickPreset) => void;
};

export function QuickPresetTabs({
  active,
  onChange,
}: QuickPresetTabsProps) {
  return (
    <>
      <QuickPresetButton
        active={active === "all"}
        label="All Collections"
        onClick={() => onChange("all")}
      />
      <QuickPresetButton
        active={active === "graded"}
        label="Graded"
        onClick={() => onChange("graded")}
      />
      <QuickPresetButton
        active={active === "raw"}
        label="RAW Only"
        onClick={() => onChange("raw")}
      />
      <QuickPresetButton
        active={active === "recent"}
        label="Recently Added"
        onClick={() => onChange("recent")}
      />
    </>
  );
}

function QuickPresetButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 cursor-pointer rounded-t-md border-b-2 px-1 pb-2 text-sm font-semibold leading-5 transition-colors ${
        active
          ? "border-accent text-accent"
          : "border-transparent text-text-muted hover:border-border-subtle hover:text-text-main"
      }`}
    >
      {label}
    </button>
  );
}

