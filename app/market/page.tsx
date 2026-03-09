import { searchPokemonCardsAll } from "@/lib/pokemon-tcg";
import { CardImage } from "@/components/CardImage";
import { AddFromMarketButton } from "./_components/add-from-market-button";

type MarketPageProps = {
  // In the latest App Router, searchParams is a Promise
  searchParams: Promise<{ q?: string; page?: string }>;
};

const PAGE_SIZE = 20;

export default async function MarketPage(props: MarketPageProps) {
  const { q, page: rawPage } = await props.searchParams;
  const query = q?.toString() ?? "";
  const page = Math.max(1, Number.parseInt(rawPage ?? "1", 10) || 1);

  const allCards = query ? await searchPokemonCardsAll(query, 50, 10) : [];
  const total = allCards.length;

  const startIndex = (page - 1) * PAGE_SIZE;
  const pageCards = allCards.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <main className="min-h-screen bg-page text-text-main px-4 py-8">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <header className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-text-muted">
            Market
          </p>
          <h1 className="text-2xl font-semibold sm:text-3xl">
            Search Pokémon cards
          </h1>
          <p className="text-sm text-text-muted">
            Use the search bar above to find cards from the Pokémon TCG
            database, then add them to your portfolio.
          </p>
        </header>

        {!query ? (
          <section className="rounded-xl border border-border-subtle bg-card px-4 py-10 text-center text-sm text-text-muted">
            Start by typing a card name in the search bar.
          </section>
        ) : total === 0 ? (
          <section className="rounded-xl border border-border-subtle bg-card px-4 py-10 text-center text-sm text-text-muted">
            No cards found for <span className="font-medium">{query}</span>.
          </section>
        ) : (
              <section className="space-y-3">
            <p className="text-xs text-text-muted">
              Showing {pageCards.length} of {total} result
              {total === 1 ? "" : "s"} for{" "}
              <span className="font-medium">{query}</span>
            </p>
            <ul className="divide-y divide-border-subtle rounded-xl border border-border-subtle bg-card">
              {pageCards.map((card) => (
                <li
                  key={card.id}
                  className="flex items-center gap-7 px-5 py-6 text-lg md:gap-9 md:px-7 md:py-7"
                >
                  <CardImage
                    src={card.imageUrl}
                    alt={card.name}
                    className="h-24 w-16 md:h-28 md:w-20"
                  />

                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="truncate font-medium text-text-main">
                        {card.name}
                        {card.cardNumber != null && card.setTotal != null ? (
                          <> {card.cardNumber}/{card.setTotal}</>
                        ) : card.cardNumber != null ? (
                          <> {card.cardNumber}</>
                        ) : null}
                      </p>
                      {card.rarity ? (
                        <span className="shrink-0 rounded-full bg-surface-soft px-2 py-0.5 text-[11px] text-text-muted">
                          {card.rarity}
                        </span>
                      ) : null}
                    </div>
                    <p className="truncate text-xs text-text-muted">
                      {card.setName ?? "Unknown set"}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <AddFromMarketButton card={card} />
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between pt-3 text-xs text-text-muted">
              <div>
                Page {page}
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={
                    page > 1
                      ? `/market?q=${encodeURIComponent(query)}&page=${page - 1}`
                      : "#"
                  }
                  aria-disabled={page <= 1}
                  className={`rounded-full px-3 py-1 font-medium ${
                    page <= 1
                      ? "cursor-not-allowed opacity-40"
                      : "cursor-pointer hover:bg-surface-soft"
                  }`}
                >
                  Previous
                </a>
                <a
                  href={
                    startIndex + PAGE_SIZE < total
                      ? `/market?q=${encodeURIComponent(query)}&page=${page + 1}`
                      : "#"
                  }
                  aria-disabled={startIndex + PAGE_SIZE >= total}
                  className={`rounded-full px-3 py-1 font-medium ${
                    startIndex + PAGE_SIZE >= total
                      ? "cursor-not-allowed opacity-40"
                      : "cursor-pointer hover:bg-surface-soft"
                  }`}
                >
                  Next
                </a>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
