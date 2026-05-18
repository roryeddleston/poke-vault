"use client";

import { Dialog } from "@/components/Dialog";

type SetAsDefaultModalProps = {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
};

export function SetAsDefaultModal({
  open,
  loading,
  onClose,
  onConfirm,
}: SetAsDefaultModalProps) {
  return (
    <Dialog
      open={open}
      dismissible={!loading}
      onClose={onClose}
      labelledBy="set-default-title"
      panelClassName="w-full max-w-md rounded-2xl border border-border-subtle bg-card p-5 shadow-2xl"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <h2 id="set-default-title" className="text-lg font-semibold text-text-main">
          Set as default portfolio?
        </h2>
        <button
          type="button"
          onClick={() => onClose()}
          className="cursor-pointer px-2 py-0.5 text-2xl leading-none text-text-muted transition-colors hover:text-text-main"
          aria-label="Close"
          disabled={loading}
        >
          ×
        </button>
      </div>

      <p className="rounded-lg border border-amber-300/40 bg-amber-100/40 px-3 py-2 text-xs text-amber-700">
        Warning: developer use only. This action updates the template baseline
        used by reset/seed flows.
      </p>
      <p className="mt-3 text-sm text-text-muted">
        Continue only if you intend to replace the default demo/template
        portfolio with your current portfolio.
      </p>

      <div className="mt-5 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => onClose()}
          className="cursor-pointer rounded-full border border-transparent px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:border-border-subtle hover:bg-surface-soft hover:text-text-main"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onConfirm()}
          disabled={loading}
          className="inline-flex cursor-pointer items-center justify-center rounded-full bg-accent px-5 py-2 text-sm font-semibold text-gray-900 shadow-sm transition-colors hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Saving…" : "Yes, set as default"}
        </button>
      </div>
    </Dialog>
  );
}

