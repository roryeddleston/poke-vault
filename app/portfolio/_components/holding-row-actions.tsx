"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/Dialog";
import { TrashIcon } from "@/components/icons";

type HoldingRowActionsProps = {
  holdingId: string;
};

export function HoldingRowActions({ holdingId }: HoldingRowActionsProps) {
  const router = useRouter();
  const [removing, setRemoving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleRemove = async () => {
    if (removing) return;

    // Close the modal immediately; perform deletion in the background.
    setConfirmOpen(false);
    setRemoving(true);
    try {
      const res = await fetch(`/api/holdings/${holdingId}`, {
        method: "DELETE",
      });

      if (!res.ok && res.status !== 204) {
        // Best-effort error surface; portfolio will stay unchanged if this fails.
        console.error("Failed to delete holding", await res.text().catch(() => ""));
        return;
      }

      router.refresh();
    } finally {
      setRemoving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        disabled={removing}
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-transparent text-danger transition-colors hover:border-danger/20 hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-70 sm:h-10 sm:w-10"
      >
        <TrashIcon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
        <span className="sr-only">Remove card</span>
      </button>

      <Dialog
        open={confirmOpen}
        dismissible={!removing}
        onClose={() => setConfirmOpen(false)}
        labelledBy="remove-holding-title"
        panelClassName="w-full max-w-sm rounded-2xl border border-border-subtle bg-card p-5 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id="remove-holding-title" className="text-xl font-semibold text-text-main">
            Remove card
          </h2>
          <button
            type="button"
            onClick={() => setConfirmOpen(false)}
            className="cursor-pointer px-2 py-0.5 text-3xl leading-none text-text-muted transition-colors hover:text-text-main"
            aria-label="Close"
            disabled={removing}
          >
            ✕
          </button>
        </div>
        <p className="mb-4 text-xs text-text-muted">
          This will remove the card from your portfolio and delete its value
          history. You can always add it again later from Search.
        </p>
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setConfirmOpen(false)}
            className="cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-surface-soft hover:text-text-main"
            disabled={removing}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleRemove}
            disabled={removing}
            className="inline-flex cursor-pointer items-center justify-center rounded-full bg-danger px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-danger/80 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {removing ? "Removing…" : "Remove card"}
          </button>
        </div>
      </Dialog>
    </>
  );
}

