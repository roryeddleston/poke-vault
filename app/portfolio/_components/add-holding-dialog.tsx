"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AddHoldingDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function AddHoldingDialog({ open, onClose }: AddHoldingDialogProps) {
  const router = useRouter();
  const [cardId, setCardId] = useState("");
  const [cardName, setCardName] = useState("");
  const [setName, setSetName] = useState("");
  const [grade, setGrade] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const resetStateAndClose = () => {
    setCardId("");
    setCardName("");
    setSetName("");
    setGrade("");
    setPurchasePrice("");
    setQuantity("1");
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setError(null);

    const priceNumber = Number(purchasePrice);
    const qtyNumber = Number(quantity);

    if (!Number.isFinite(priceNumber) || priceNumber < 0) {
      setError("Enter a valid purchase price.");
      return;
    }

    if (!Number.isInteger(qtyNumber) || qtyNumber <= 0) {
      setError("Quantity must be a positive integer.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/holdings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId: cardId.trim(),
          cardName: cardName.trim(),
          setName: setName.trim(),
          grade: grade.trim(),
          purchasePrice: priceNumber,
          quantity: qtyNumber,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(data?.error ?? "Failed to add card.");
        setSubmitting(false);
        return;
      }

      router.refresh();
      resetStateAndClose();
    } catch (err) {
      console.error("AddHoldingDialog submit failed:", err);
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-holding-title"
      onClick={resetStateAndClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border-subtle bg-card p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2
            id="add-holding-title"
            className="text-xl font-semibold text-text-main"
          >
            Add card to portfolio
          </h2>
          <button
            type="button"
            onClick={resetStateAndClose}
            className="cursor-pointer px-2 py-0.5 text-3xl leading-none text-text-muted transition-colors hover:text-text-main"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form className="space-y-3 text-sm" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-text-muted">
              Card ID
            </label>
            <input
              required
              value={cardId}
              onChange={(e) => setCardId(e.target.value)}
              className="w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-text-main outline-none transition-colors focus:border-accent"
              placeholder="e.g. base1-4"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-text-muted">
              Card name
            </label>
            <input
              required
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              className="w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-text-main outline-none transition-colors focus:border-accent"
              placeholder="Charizard Holo"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-text-muted">
              Set name
            </label>
            <input
              required
              value={setName}
              onChange={(e) => setSetName(e.target.value)}
              className="w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-text-main outline-none transition-colors focus:border-accent"
              placeholder="Base Set"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1 space-y-1">
              <label className="block text-xs font-medium text-text-muted">
                Grade
              </label>
              <input
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-text-main outline-none transition-colors focus:border-accent"
                placeholder="e.g. PSA 10 (leave blank for RAW)"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 space-y-1">
              <label className="block text-xs font-medium text-text-muted">
                Purchase price
              </label>
              <input
                required
                inputMode="decimal"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-text-main outline-none transition-colors focus:border-accent"
                placeholder="0"
              />
            </div>
            <div className="w-24 space-y-1">
              <label className="block text-xs font-medium text-text-muted">
                Qty
              </label>
              <input
                required
                inputMode="numeric"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-text-main outline-none transition-colors focus:border-accent"
                placeholder="1"
              />
            </div>
          </div>

          {error ? (
            <p className="text-xs text-danger" role="alert">
              {error}
            </p>
          ) : null}

          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={resetStateAndClose}
              className="cursor-pointer rounded-full border border-transparent px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:border-border-subtle hover:bg-surface-soft hover:text-text-main"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex cursor-pointer items-center justify-center rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Adding…" : "Add card"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
