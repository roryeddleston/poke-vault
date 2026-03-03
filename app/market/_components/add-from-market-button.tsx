"use client";

import { useState } from "react";
import type { PokemonCardSummary } from "@/lib/pokemon-tcg";
import { AddFromMarketDialog } from "./add-from-market-dialog";

type AddFromMarketButtonProps = {
  card: PokemonCardSummary;
};

export function AddFromMarketButton({ card }: AddFromMarketButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex cursor-pointer items-center justify-center rounded-full border border-border-subtle bg-surface px-3 py-1.5 text-xs font-medium text-text-main shadow-sm transition-colors hover:bg-surface-soft"
      >
        Add to portfolio
      </button>
      <AddFromMarketDialog
        open={open}
        onClose={() => setOpen(false)}
        card={card}
      />
    </>
  );
}

