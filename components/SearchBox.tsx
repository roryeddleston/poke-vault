"use client";

import { useEffect, useRef, useState } from "react";
import { useClickOutside } from "@/hooks/use-click-outside";
import { usePathname, useRouter } from "next/navigation";
import { SearchIcon } from "./icons";
import type { PokemonCardSummary } from "@/lib/pokemon-tcg";
import { CardImage } from "./CardImage";

type Suggestion = PokemonCardSummary;

export function SearchBox() {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    let cancelled = false;
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/cards/search?q=${encodeURIComponent(query.trim())}`,
        );
        if (!res.ok) {
          if (!cancelled) {
            setSuggestions([]);
            setOpen(false);
          }
          return;
        }
        const data = (await res.json()) as Suggestion[];
        if (!cancelled) {
          setSuggestions(data);
          setOpen(data.length > 0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [query]);

  useClickOutside(containerRef, () => setOpen(false));

  useEffect(() => {
    if (!pathname?.startsWith("/market")) return;
    inputRef.current?.focus();
  }, [pathname]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/market?q=${encodeURIComponent(q)}`);
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
  };

  const handleSuggestionClick = (s: Suggestion) => {
    router.push(`/market?q=${encodeURIComponent(s.name)}`);
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
  };

  return (
    <div ref={containerRef} className="relative flex-1">
      <form
        onSubmit={handleSubmit}
        className="flex h-10 items-center gap-2 rounded-lg border border-border-subtle bg-card px-3 text-sm text-text-muted shadow-sm transition-colors focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30"
      >
        <SearchIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
        <input
          type="search"
          ref={inputRef}
          role="combobox"
          aria-expanded={open}
          aria-controls="global-search-suggestions"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(suggestions.length > 0)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder="Search cards by name or number (e.g. 60/64)"
          className="w-full bg-transparent text-sm text-text-main placeholder:text-text-muted focus:outline-none"
        />
        {loading ? (
          <span className="text-[10px] text-text-muted">…</span>
        ) : null}
      </form>

      {open && suggestions.length > 0 && (
        <ul
          id="global-search-suggestions"
          className="absolute z-40 mt-1 max-h-80 w-full overflow-auto rounded-xl border border-border-subtle bg-card text-sm shadow-lg"
        >
          {suggestions.map((s, index) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => handleSuggestionClick(s)}
                className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left hover:bg-surface-soft"
              >
                {s.imageUrl ? (
                  <CardImage
                    src={s.imageUrl}
                    alt={s.name}
                    className="h-8 w-6 rounded-sm bg-surface-soft"
                    sizes="24px"
                    priority={index < 3}
                    unoptimized
                  />
                ) : (
                  <div className="flex h-8 w-6 items-center justify-center rounded-sm bg-surface-soft text-[10px] text-text-muted">
                    ?
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-text-main">
                    {s.name}
                  </p>
                  <p className="truncate text-[11px] text-text-muted">
                    {s.setName ?? "Unknown set"}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
