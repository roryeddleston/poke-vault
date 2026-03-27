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

  const allCards = query ? await searchPokemonCardsAll(query, 50, 10) : [];
  const total = allCards.length;
  const totalPages =
    total === 0 ? 1 : Math.max(1, Math.ceil(total / PAGE_SIZE));

  const startIndex = (page - 1) * PAGE_SIZE;
  const pageCards = allCards.slice(startIndex, startIndex + PAGE_SIZE);
  const startDisplay = total === 0 ? 0 : startIndex + 1;
  const endDisplay = startIndex + pageCards.length;

  return (
    <PageShell
      mainClassName="min-h-screen bg-page px-4 py-8 text-text-main"
      containerClassName="mx-auto w-full max-w-5xl space-y-6"
    >
      <PageIntro
        title="Search Pokémon cards"
        subtitle="Use the search bar above to find cards from the Pokémon TCG database, then add them to your portfolio."
      />

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

                  <div className="flex shrink-0 items-center gap-2">
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
            <div className="flex items-center justify-between pt-3 text-xs text-text-muted">
              <div>
                Page {page} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                {page > 1 ? (
                  <Link
                    href={`/market?q=${encodeURIComponent(query)}&page=${
                      page - 1
                    }`}
                    className="rounded-full px-3 py-1 font-medium cursor-pointer hover:bg-surface-soft"
                  >
                    Previous
                  </Link>
                ) : (
                  <span className="rounded-full px-3 py-1 font-medium cursor-not-allowed opacity-40">
                    Previous
                  </span>
                )}
                {startIndex + PAGE_SIZE < total ? (
                  <Link
                    href={`/market?q=${encodeURIComponent(query)}&page=${
                      page + 1
                    }`}
                    className="rounded-full px-3 py-1 font-medium cursor-pointer hover:bg-surface-soft"
                  >
                    Next
                  </Link>
                ) : (
                  <span className="rounded-full px-3 py-1 font-medium cursor-not-allowed opacity-40">
                    Next
                  </span>
                )}
              </div>
            </div>
        </section>
      )}
    </PageShell>
  );
}
