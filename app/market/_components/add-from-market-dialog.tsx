"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiChevronDown } from "react-icons/fi";
import type { PokemonCardSummary } from "@/lib/pokemon-tcg";
import {
  HOLDING_EDITION_LABELS,
  HOLDING_FINISH_LABELS,
  type HoldingEdition,
  type HoldingFinish,
} from "@/lib/holding-options";

type AddFromMarketDialogProps = {
  open: boolean;
  onClose: () => void;
  card: PokemonCardSummary;
};

const GRADING_COMPANIES = ["RAW", "PSA", "ACE", "BGS", "CGC"] as const;
const GRADE_OPTIONS = [
  "10",
  "9.5",
  "9",
  "8.5",
  "8",
  "7.5",
  "7",
  "6",
  "5",
  "4",
  "3",
  "2",
  "1",
] as const;

function getAvailableFinishes(card: PokemonCardSummary): HoldingFinish[] {
  const variants = card.variants;
  const finishes: HoldingFinish[] = [];
  if (variants?.normal) finishes.push("NORMAL");
  if (variants?.holo) finishes.push("HOLO");
  if (variants?.reverse) finishes.push("REVERSE");
  return finishes.length > 0 ? finishes : ["NORMAL"];
}

function getAvailableEditions(card: PokemonCardSummary): HoldingEdition[] {
  return card.variants?.firstEdition
    ? ["UNLIMITED", "FIRST_EDITION"]
    : ["UNLIMITED"];
}

export function AddFromMarketDialog({
  open,
  onClose,
  card,
}: AddFromMarketDialogProps) {
  const router = useRouter();
  const [gradingCompany, setGradingCompany] =
    useState<(typeof GRADING_COMPANIES)[number]>("RAW");
  const [gradeValue, setGradeValue] = useState("");
  const availableFinishes = getAvailableFinishes(card);
  const availableEditions = getAvailableEditions(card);
  const defaultFinish: HoldingFinish = availableFinishes[0];
  const [finish, setFinish] = useState<HoldingFinish>(defaultFinish);
  const defaultEdition: HoldingEdition = availableEditions[0];
  const [edition, setEdition] = useState<HoldingEdition>(defaultEdition);
  const [purchasePrice, setPurchasePrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setFinish(defaultFinish);
    setEdition(defaultEdition);
  }, [open, card.id, defaultFinish, defaultEdition]);

  if (!open) return null;

  const resetAndClose = () => {
    setGradingCompany("RAW");
    setGradeValue("");
    setFinish(defaultFinish);
    setEdition(defaultEdition);
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

    if (gradingCompany !== "RAW" && !gradeValue) {
      setError("Please select a grade.");
      return;
    }

    const normalizedGrade =
      gradingCompany === "RAW" ? "RAW" : `${gradingCompany} ${gradeValue}`;

    setSubmitting(true);
    try {
      const res = await fetch("/api/holdings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId: card.id,
          cardName: card.name,
          setName: card.setName ?? "Unknown set",
          imageUrl: card.imageUrl,
          cardNumber: card.cardNumber,
          setTotal: card.setTotal,
          grade: normalizedGrade,
          finish,
          edition,
          purchasePrice: priceNumber,
          quantity: qtyNumber,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(data?.error ?? "Failed to add card.");
        setSubmitting(false);
        return;
      }

      router.refresh();
      resetAndClose();
    } catch (err) {
      console.error("AddFromMarketDialog submit failed:", err);
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-from-market-title"
      onClick={resetAndClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border-subtle bg-card p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2
            id="add-from-market-title"
            className="text-base font-semibold text-text-main"
          >
            Add to portfolio
          </h2>
          <button
            type="button"
            onClick={resetAndClose}
            className="cursor-pointer px-2 py-0.5 text-3xl leading-none text-text-muted transition-colors hover:text-text-main"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="mb-3 space-y-1 text-sm">
          <p className="font-medium text-text-main">{card.name}</p>
          <p className="text-xs text-text-muted">
            {card.setName ?? "Unknown set"}
          </p>
          {card.rarity ? (
            <p className="text-xs text-text-muted">Rarity: {card.rarity}</p>
          ) : null}
        </div>

        <form className="space-y-3 text-sm" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-text-muted">
                Grading company
              </label>
              <div className="relative">
                <select
                  value={gradingCompany}
                  onChange={(e) =>
                    setGradingCompany(
                      e.target.value as (typeof GRADING_COMPANIES)[number],
                    )
                  }
                  className="w-full cursor-pointer appearance-none rounded-lg border border-border-subtle bg-surface px-3 py-2 pr-9 text-sm text-text-main outline-none focus:border-accent"
                >
                  {GRADING_COMPANIES.map((company) => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
                </select>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-text-muted"
                >
                  <FiChevronDown className="h-4 w-4" />
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-text-muted">
                Grade
              </label>
              <div className="relative">
                <select
                  value={gradeValue}
                  onChange={(e) => setGradeValue(e.target.value)}
                  disabled={gradingCompany === "RAW"}
                  className="w-full cursor-pointer appearance-none rounded-lg border border-border-subtle bg-surface px-3 py-2 pr-9 text-sm text-text-main outline-none focus:border-accent disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">Select grade</option>
                  {GRADE_OPTIONS.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-text-muted"
                >
                  <FiChevronDown className="h-4 w-4" />
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-text-muted">
                Finish
              </label>
              <div className="relative">
                <select
                  value={finish}
                  onChange={(e) => setFinish(e.target.value as HoldingFinish)}
                  className="w-full cursor-pointer appearance-none rounded-lg border border-border-subtle bg-surface px-3 py-2 pr-9 text-sm text-text-main outline-none focus:border-accent"
                >
                  {availableFinishes.map((opt) => (
                    <option key={opt} value={opt}>
                      {HOLDING_FINISH_LABELS[opt]}
                    </option>
                  ))}
                </select>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-text-muted"
                >
                  <FiChevronDown className="h-4 w-4" />
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-text-muted">
                Edition
              </label>
              <div className="relative">
                <select
                  value={edition}
                  onChange={(e) => setEdition(e.target.value as HoldingEdition)}
                  disabled={availableEditions.length === 1}
                  className="w-full cursor-pointer appearance-none rounded-lg border border-border-subtle bg-surface px-3 py-2 pr-9 text-sm text-text-main outline-none focus:border-accent"
                >
                  {availableEditions.map((opt) => (
                    <option key={opt} value={opt}>
                      {HOLDING_EDITION_LABELS[opt]}
                    </option>
                  ))}
                </select>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-text-muted"
                >
                  <FiChevronDown className="h-4 w-4" />
                </span>
              </div>
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
                className="w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-text-main outline-none focus:border-accent"
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
                className="w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-text-main outline-none focus:border-accent"
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
              onClick={resetAndClose}
              className="cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium text-text-muted hover:text-text-main"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex cursor-pointer items-center justify-center rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Adding…" : "Add card"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

