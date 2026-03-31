import { searchPokemonCardsAll } from "@/lib/pokemon-tcg";
import { CardImage } from "@/components/CardImage";
import { PageIntro } from "@/components/PageIntro";
import { PageShell } from "@/components/PageShell";
import Link from "next/link";
import { AddFromMarketButton } from "./_components/add-from-market-button";

type MarketPageProps = {
  // In the latest App Router, searchParams is a Promise
  searchParams: Promise<{ q?: string; page?: string }>;
};

const PAGE_SIZE = 10;

export default async function MarketPage(props: MarketPageProps) {
  const { q, page: rawPage } = await props.searchParams;
  const query = q?.toString() ?? "";
  const page = Math.max(1, Number.parseInt(rawPage ?? "1", 10) || 1);

  const allCards = query ? await searchPokemonCardsAll(query, 50, 20) : [];
  const total = allCards.length;
  const totalPages =
    total === 0 ? 1 : Math.max(1, Math.ceil(total / PAGE_SIZE));

  const startIndex = (page - 1) * PAGE_SIZE;
  const pageCards = allCards.slice(startIndex, startIndex + PAGE_SIZE);
  const startDisplay = total === 0 ? 0 : startIndex + 1;
  const endDisplay = startIndex + pageCards.length;
  const canPrev = page > 1;
  const canNext = page < totalPages;
  const pageNumbers: number[] = [];
  const showMax = 5;
  let low = Math.max(1, page - Math.floor(showMax / 2));
  const high = Math.min(totalPages, low + showMax - 1);
  if (high - low + 1 < showMax) {
    low = Math.max(1, high - showMax + 1);
  }
  for (let i = low; i <= high; i++) pageNumbers.push(i);

  return (
    <PageShell
      mainClassName="min-h-screen bg-page px-4 py-8 text-text-main"
      containerClassName="mx-auto w-full max-w-5xl space-y-6"
    >
      {!query ? (
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-xs font-medium tracking-[0.08em] text-text-muted uppercase">
            Use the search bar above
          </p>
          <div className="flex items-center gap-1 text-accent">
            <span className="text-lg leading-none">↑</span>
            <span className="text-xl leading-none">↑</span>
            <span className="text-lg leading-none">↑</span>
          </div>
        </div>
      ) : null}

      <PageIntro
        title="Search Pokémon cards"
        subtitle="Find cards by name or card number, review the result, then add cards directly to your portfolio."
      />

      {!query ? null : total === 0 ? (
        <section className="rounded-xl border border-border-subtle bg-card px-4 py-10 text-center text-sm text-text-muted">
          No cards found for <span className="font-medium">{query}</span>.
        </section>
      ) : (
        <section className="space-y-3">
            <p className="text-xs text-text-muted">
              Showing {startDisplay}–{endDisplay} of {total} result
              {total === 1 ? "" : "s"} for{" "}
              <span className="font-medium">{query}</span> (page {page} of{" "}
              {totalPages})
            </p>
            <ul className="divide-y divide-border-subtle rounded-xl border border-border-subtle bg-card">
              {pageCards.map((card, index) => (
                <li
                  key={card.id}
                  className="flex items-center gap-7 px-5 py-6 text-lg md:gap-9 md:px-7 md:py-7"
                >
                  <CardImage
                    src={card.imageUrl}
                    alt={card.name}
                    className="h-24 w-16 md:h-28 md:w-20"
                    sizes="(max-width: 768px) 64px, 80px"
                    priority={index < 4}
                  />

                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-baseline gap-3">
                      <p className="truncate font-medium text-text-main">
                        {card.name}
                        {card.cardNumber != null && card.setTotal != null ? (
                          <>
                            {" "}
                            {card.cardNumber}/{card.setTotal}
                          </>
                        ) : card.cardNumber != null ? (
                          <> {card.cardNumber}</>
                        ) : null}
                      </p>
                    </div>
                    <p className="truncate text-xs text-text-muted">
                      {card.setName ?? "Unknown set"}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    {card.rarity ? (
                      <span className="shrink-0 rounded-full bg-surface-soft px-2 py-0.5 text-[11px] text-text-muted">
                        {card.rarity}
                      </span>
                    ) : null}
                    <AddFromMarketButton card={card} />
                  </div>
                </li>
              ))}
            </ul>
            <nav
              aria-label="Search pagination"
              className="flex flex-col items-center justify-between gap-2 rounded-2xl border border-border-subtle bg-card px-4 py-3 shadow-sm sm:flex-row"
            >
              <p className="text-xs text-text-muted">
                Showing {startDisplay} to {endDisplay} of {total} results
              </p>
              <div className="flex flex-wrap items-center justify-center gap-1">
                {canPrev ? (
                  <Link
                    href={`/market?q=${encodeURIComponent(query)}&page=${page - 1}`}
                    className="rounded-full border border-border-subtle bg-card px-3 py-1.5 text-xs font-medium text-text-main shadow-sm transition-colors hover:bg-surface-soft"
                  >
                    Previous
                  </Link>
                ) : (
                  <span className="rounded-full border border-border-subtle bg-card px-3 py-1.5 text-xs font-medium text-text-main shadow-sm opacity-50">
                    Previous
                  </span>
                )}

                {pageNumbers.map((n) =>
                  n === page ? (
                    <span
                      key={n}
                      aria-current="page"
                      className="min-w-8 rounded-full bg-accent px-2.5 py-1.5 text-center text-xs font-medium text-slate-950"
                    >
                      {n}
                    </span>
                  ) : (
                    <Link
                      key={n}
                      href={`/market?q=${encodeURIComponent(query)}&page=${n}`}
                      className="min-w-8 rounded-full border border-border-subtle bg-card px-2.5 py-1.5 text-center text-xs font-medium text-text-main transition-colors hover:bg-surface-soft"
                    >
                      {n}
                    </Link>
                  ),
                )}

                {canNext ? (
                  <Link
                    href={`/market?q=${encodeURIComponent(query)}&page=${page + 1}`}
                    className="rounded-full border border-border-subtle bg-card px-3 py-1.5 text-xs font-medium text-text-main shadow-sm transition-colors hover:bg-surface-soft"
                  >
                    Next
                  </Link>
                ) : (
                  <span className="rounded-full border border-border-subtle bg-card px-3 py-1.5 text-xs font-medium text-text-main shadow-sm opacity-50">
                    Next
                  </span>
                )}
              </div>
            </nav>
        </section>
      )}

      {!query ? (
        <section className="shadow-elevation-1 rounded-2xl border border-border-subtle bg-card p-5 sm:p-6">
          <div className="grid gap-4 lg:grid-cols-3">
            <article className="rounded-xl border border-border-subtle bg-surface px-4 py-4">
              <p className="text-xs font-semibold tracking-[0.08em] text-text-muted uppercase">
                1. Search
              </p>
              <p className="mt-2 text-sm text-text-main">
                Use a card name, number, or number pair.
              </p>
              <p className="mt-2 text-xs text-text-muted">
                Examples:{" "}
                <span className="font-medium text-text-main">Pikachu</span>,{" "}
                <span className="font-medium text-text-main">Charizard 4/102</span>,{" "}
                <span className="font-medium text-text-main">60/64</span>
              </p>
            </article>

            <article className="rounded-xl border border-border-subtle bg-surface px-4 py-4">
              <p className="text-xs font-semibold tracking-[0.08em] text-text-muted uppercase">
                2. Check the match
              </p>
              <p className="mt-2 text-sm text-text-main">
                Confirm the set and card number shown in each result row.
              </p>
              <p className="mt-2 text-xs text-text-muted">
                This helps avoid adding the wrong print or set variant.
              </p>
            </article>

            <article className="rounded-xl border border-accent/25 bg-accent-muted/45 px-4 py-4">
              <p className="text-xs font-semibold tracking-[0.08em] text-accent uppercase">
                3. Add to portfolio
              </p>
              <p className="mt-2 text-sm text-text-main">
                Click <span className="font-semibold">Add to portfolio</span>, then set
                grade, finish, edition, quantity, and purchase price.
              </p>
              <p className="mt-2 text-xs text-text-muted">
                You can add the same card multiple times with different grades.
              </p>
            </article>
          </div>
        </section>
      ) : null}
    </PageShell>
  );
}
