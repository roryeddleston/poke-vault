import { searchPokemonCards } from "@/lib/pokemon-tcg";
import { AddFromMarketButton } from "./_components/add-from-market-button";

type MarketPageProps = {
  // In the latest App Router, searchParams is a Promise
  searchParams: Promise<{ q?: string }>;
};

export default async function MarketPage(props: MarketPageProps) {
  const { q } = await props.searchParams;
  const query = q?.toString() ?? "";

  const cards = query ? await searchPokemonCards(query, 20) : [];

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
        ) : cards.length === 0 ? (
          <section className="rounded-xl border border-border-subtle bg-card px-4 py-10 text-center text-sm text-text-muted">
            No cards found for <span className="font-medium">{query}</span>.
          </section>
        ) : (
          <section className="space-y-3">
            <p className="text-xs text-text-muted">
              Showing {cards.length} result{cards.length === 1 ? "" : "s"} for{" "}
              <span className="font-medium">{query}</span>
            </p>
            <ul className="divide-y divide-border-subtle rounded-xl border border-border-subtle bg-card">
              {cards.map((card) => (
                <li
                  key={card.id}
                  className="flex items-center gap-6 px-5 py-5 text-lg md:gap-8 md:px-6 md:py-6"
                >
                  <div className="flex h-24 w-16 items-center justify-center overflow-hidden rounded-sm bg-surface-soft md:h-28 md:w-20">
                    {card.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={card.imageUrl}
                        alt={card.name}
                        className="max-h-full max-w-full object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-text-muted">
                        ?
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="truncate font-medium text-text-main">
                        {card.name}
                      </p>
                      {card.rarity ? (
                        <span className="shrink-0 rounded-full bg-surface-soft px-2 py-0.5 text-[11px] text-text-muted">
                          {card.rarity}
                        </span>
                      ) : null}
                    </div>
                    <p className="truncate text-xs text-text-muted">
                      {card.setName ?? "Unknown set"}
                      {card.cardNumber != null && card.setTotal != null ? (
                        <>
                          {" "}
                          · {card.cardNumber}/{card.setTotal}
                        </>
                      ) : card.cardNumber != null ? (
                        <> · {card.cardNumber}</>
                      ) : null}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <AddFromMarketButton card={card} />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
