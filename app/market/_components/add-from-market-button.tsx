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
        className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-soft"
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

