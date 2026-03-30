"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  dismissible?: boolean;
  labelledBy?: string;
  describedBy?: string;
  panelClassName?: string;
  children: ReactNode;
};

/**
 * Minimal, reusable dialog primitive (backdrop click + ESC to close).
 * Individual dialogs provide their own panel layout/classes.
 */
export function Dialog({
  open,
  onClose,
  dismissible = true,
  labelledBy,
  describedBy,
  panelClassName = "w-full max-w-md",
  children,
}: DialogProps) {
  useEffect(() => {
    if (!open || !dismissible) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, dismissible, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onClick={() => {
        if (dismissible) onClose();
      }}
    >
      <div
        className={panelClassName}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        role="document"
      >
        {children}
      </div>
    </div>
  );
}

