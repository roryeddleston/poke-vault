"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/Dialog";
import { FiChevronDown } from "react-icons/fi";
import {
  HOLDING_EDITIONS,
  HOLDING_EDITION_LABELS,
  HOLDING_FINISHES,
  HOLDING_FINISH_LABELS,
  type HoldingEdition,
  type HoldingFinish,
} from "@/lib/holding-options";

type AddHoldingDialogProps = {
  open: boolean;
  onClose: () => void;
};

type AddHoldingFields = {
  cardId: string;
  cardName: string;
  setName: string;
  grade: string;
  finish: HoldingFinish;
  edition: HoldingEdition;
  purchasePrice: string;
  quantity: string;
};

const DEFAULTS: AddHoldingFields = {
  cardId: "",
  cardName: "",
  setName: "",
  grade: "",
  finish: "NORMAL",
  edition: "UNLIMITED",
  purchasePrice: "",
  quantity: "1",
};

export function AddHoldingDialog({ open, onClose }: AddHoldingDialogProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AddHoldingFields>({ defaultValues: DEFAULTS });

  if (!open) return null;

  const handleClose = () => {
    reset(DEFAULTS);
    onClose();
  };

  const onSubmit = async (fields: AddHoldingFields) => {
    const res = await fetch("/api/holdings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cardId: fields.cardId.trim(),
        cardName: fields.cardName.trim(),
        setName: fields.setName.trim(),
        grade: fields.grade.trim(),
        finish: fields.finish,
        edition: fields.edition,
        purchasePrice: Number(fields.purchasePrice),
        quantity: Number(fields.quantity),
      }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setError("root", { message: data?.error ?? "Failed to add card." });
      return;
    }

    router.refresh();
    handleClose();
  };

  return (
    <Dialog
      open={open}
      dismissible={true}
      onClose={handleClose}
      labelledBy="add-holding-title"
      panelClassName="w-full max-w-md rounded-2xl border border-border-subtle bg-card p-5 shadow-2xl"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="add-holding-title" className="text-xl font-semibold text-text-main">
          Add card to portfolio
        </h2>
        <button
          type="button"
          onClick={handleClose}
          className="cursor-pointer px-2 py-0.5 text-3xl leading-none text-text-muted transition-colors hover:text-text-main"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <form className="space-y-3 text-sm" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-1">
          <label className="block text-xs font-medium text-text-muted">Card ID</label>
          <input
            {...register("cardId", { required: true })}
            className="form-field w-full"
            placeholder="e.g. base1-4"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-text-muted">Card name</label>
          <input
            {...register("cardName", { required: true })}
            className="form-field w-full"
            placeholder="Charizard Holo"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-text-muted">Set name</label>
          <input
            {...register("setName", { required: true })}
            className="form-field w-full"
            placeholder="Base Set"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-text-muted">Grade</label>
          <input
            {...register("grade")}
            className="form-field w-full"
            placeholder="e.g. PSA 10 (leave blank for RAW)"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-text-muted">Finish</label>
            <div className="relative">
              <select
                {...register("finish")}
                className="form-field w-full cursor-pointer appearance-none pr-9"
              >
                {HOLDING_FINISHES.map((opt) => (
                  <option key={opt} value={opt}>
                    {HOLDING_FINISH_LABELS[opt]}
                  </option>
                ))}
              </select>
              <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-text-muted">
                <FiChevronDown className="h-4 w-4" />
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-text-muted">Edition</label>
            <div className="relative">
              <select
                {...register("edition")}
                className="form-field w-full cursor-pointer appearance-none pr-9"
              >
                {HOLDING_EDITIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {HOLDING_EDITION_LABELS[opt]}
                  </option>
                ))}
              </select>
              <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-text-muted">
                <FiChevronDown className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 space-y-1">
            <label className="block text-xs font-medium text-text-muted">Purchase price</label>
            <input
              {...register("purchasePrice", {
                required: true,
                validate: (v) =>
                  (Number.isFinite(Number(v)) && Number(v) >= 0) ||
                  "Enter a valid purchase price.",
              })}
              inputMode="decimal"
              className="form-field w-full"
              placeholder="0"
            />
          </div>
          <div className="w-24 space-y-1">
            <label className="block text-xs font-medium text-text-muted">Qty</label>
            <input
              {...register("quantity", {
                required: true,
                validate: (v) =>
                  (Number.isInteger(Number(v)) && Number(v) > 0) ||
                  "Quantity must be a positive integer.",
              })}
              inputMode="numeric"
              className="form-field w-full"
              placeholder="1"
            />
          </div>
        </div>

        {(errors.purchasePrice?.message ||
          errors.quantity?.message ||
          errors.root?.message) ? (
          <p className="text-xs text-danger" role="alert">
            {errors.purchasePrice?.message ??
              errors.quantity?.message ??
              errors.root?.message}
          </p>
        ) : null}

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="cursor-pointer rounded-full border border-transparent px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:border-border-subtle hover:bg-surface-soft hover:text-text-main"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex cursor-pointer items-center justify-center rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Adding…" : "Add card"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
