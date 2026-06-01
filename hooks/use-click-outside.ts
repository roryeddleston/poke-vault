"use client";

import { useEffect, type RefObject } from "react";

export function useClickOutside(
  ref: RefObject<Element | null>,
  handler: () => void,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return;
    const onMouseDown = (e: MouseEvent) => {
      if (ref.current?.contains(e.target as Node)) return;
      handler();
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [ref, handler, enabled]);
}
