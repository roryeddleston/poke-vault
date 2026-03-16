"use client";

import { useEffect, useState } from "react";
import { FiMoon, FiSun } from "react-icons/fi";

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
    const current: Theme = theme ?? getCurrentTheme();
    const next: Theme = current === "light" ? "dark" : "light";
    applyTheme(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    setTheme(next);
  };

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle dark mode"
      className="relative flex h-8 w-16 cursor-pointer items-center rounded-full border-2 border-accent p-1 transition-all duration-300 hover:border-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft focus-visible:ring-offset-2 focus-visible:ring-offset-page"
    >
      <span
        aria-hidden="true"
        className={`flex h-6 w-5 items-center justify-center rounded-full bg-transparent text-sm transition-transform duration-300 ${
          isDark ? "translate-x-8" : ""
        }`}
      >
        {isDark ? (
          <FiSun size={16} className="text-accent" />
        ) : (
          <FiMoon size={16} className="text-accent" />
        )}
      </span>
    </button>
  );
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
}

function getCurrentTheme(): Theme {
  if (typeof document === "undefined") {
    return "light";
  }
  const attr = document.documentElement.dataset.theme;
  if (attr === "light" || attr === "dark") {
    return attr;
  }
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")
    .matches;
  return prefersDark ? "dark" : "light";
}


