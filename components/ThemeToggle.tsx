"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "./icons";

type Theme = "light" | "dark";

const STORAGE_KEY = "pv-theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? (window.localStorage.getItem(STORAGE_KEY) as Theme | null)
        : null;

    if (stored === "light" || stored === "dark") {
      applyTheme(stored);
      setTheme(stored);
      return;
    }

    const prefersDark = window.matchMedia?.(
      "(prefers-color-scheme: dark)",
    ).matches;
    const initial: Theme = prefersDark ? "dark" : "light";
    applyTheme(initial);
    setTheme(initial);
  }, []);

  const toggle = () => {
    if (!theme) return;
    const next: Theme = theme === "light" ? "dark" : "light";
    applyTheme(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    setTheme(next);
  };

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Use light mode" : "Use dark mode"}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border-subtle bg-card text-text-muted shadow-sm transition-colors hover:text-text-main"
    >
      {isDark ? (
        <SunIcon className="h-4 w-4" aria-hidden="true" />
      ) : (
        <MoonIcon className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
}

