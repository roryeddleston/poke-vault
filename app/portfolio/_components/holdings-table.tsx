import type { Holding } from "../types";
import { formatGBP } from "../utils";
import { CardImagePlaceholder } from "./card-image-placeholder";
import { ChangePill } from "./change-pill";
import { GradePill } from "./grade-pill";
import { HoldingRowActions } from "./holding-row-actions";

type HoldingsTableProps = {
  holdings: Holding[];
  /** Total count when paginated; used for heading. */
  totalCount?: number;
};

/**
 * Monthly change is not in the API yet (only latest snapshot). Pass null to show "—".
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- holding used when monthly snapshots exist
function getMonthlyChange(holding: Holding): number | null {
  return null;
}

export function HoldingsTable({ holdings, totalCount }: HoldingsTableProps) {
  const count = totalCount ?? holdings.length;

  return (
    <section aria-labelledby="holdings-heading">
      <h2
        id="holdings-heading"
        className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted"
      >
        Holdings ({count})
      </h2>
      {/* Desktop / tablet table */}
      <div
        className="hidden overflow-hidden rounded-lg border border-border-subtle bg-card md:block"
        role="region"
        aria-label="Holdings table"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead className="border-b border-border-subtle text-left">
              <tr className="text-text-muted">
                <th scope="col" className="px-5 py-4 font-medium">
                  Card
                </th>
                <th scope="col" className="px-5 py-4 font-medium">
                  Set
                </th>
                <th scope="col" className="px-5 py-4 font-medium">
                  Grade
                </th>
                <th scope="col" className="px-5 py-4 font-medium text-right">
                  Market price
                </th>
                <th scope="col" className="px-5 py-4 font-medium text-right">
                  Monthly change
                </th>
                <th scope="col" className="px-5 py-4 font-medium text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h) => {
                const latest = h.snapshots[0]?.value ?? h.purchasePrice;
                const changeMonthly = getMonthlyChange(h);

                return (
                  <tr
                    key={h.id}
                    className="border-b border-border-subtle last:border-b-0"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {h.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={h.imageUrl}
                            alt={h.cardName}
                            className="h-20 w-14 rounded-md bg-surface-soft object-contain sm:h-24 sm:w-16"
                            loading="lazy"
                          />
                        ) : (
                          <CardImagePlaceholder name={h.cardName} />
                        )}
                        <span className="font-medium text-text-main">
                          {h.cardName}
                          {h.cardNumber != null && h.setTotal != null ? (
                            <> {h.cardNumber}/{h.setTotal}</>
                          ) : h.cardNumber != null ? (
                            <> {h.cardNumber}</>
                          ) : null}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-surface-soft px-2 py-0.5 text-xs text-text-muted">
                        {h.setName}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <GradePill grade={h.grade} />
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums">
                      {formatGBP(latest)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <ChangePill
                        value={changeMonthly}
                        periodLabel="this month"
                      />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <HoldingRowActions holdingId={h.id} />
                    </td>
                  </tr>
                );
              })}

              {holdings.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-text-muted"
                    colSpan={6}
                  >
                    No holdings yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile list */}
      <div className="space-y-2 md:hidden">
        {holdings.length === 0 ? (
          <div className="rounded-lg border border-border-subtle bg-card px-4 py-8 text-center text-sm text-text-muted">
            No holdings yet.
          </div>
        ) : (
          holdings.map((h) => {
            const latest = h.snapshots[0]?.value ?? h.purchasePrice;
            const changeMonthly = getMonthlyChange(h);

            return (
              <article
                key={h.id}
                className="flex items-center gap-7 rounded-lg border border-border-subtle bg-card px-5 py-6 text-base md:gap-9 md:px-7 md:py-7 md:text-lg"
              >
                <div className="flex h-24 w-16 items-center justify-center overflow-hidden rounded-md bg-surface-soft md:h-28 md:w-20">
                  {h.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={h.imageUrl}
                      alt={h.cardName}
                      className="max-h-full max-w-full object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <CardImagePlaceholder
                      name={h.cardName}
                      className="h-full w-full"
                    />
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="truncate text-sm font-medium text-text-main">
                      {h.cardName}
                      {h.cardNumber != null && h.setTotal != null ? (
                        <> {h.cardNumber}/{h.setTotal}</>
                      ) : h.cardNumber != null ? (
                        <> {h.cardNumber}</>
                      ) : null}
                    </h3>
                    <span className="shrink-0 text-xs font-medium tabular-nums">
                      {formatGBP(latest)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="rounded-full bg-surface-soft px-2 py-0.5 text-[11px] text-text-muted">
                      {h.setName}
                    </span>
                    <GradePill grade={h.grade} />
                    <span className="ml-auto">
                      <ChangePill
                        value={changeMonthly}
                        periodLabel="this month"
                      />
                    </span>
                  </div>
                </div>
                <div className="self-start">
                  <HoldingRowActions holdingId={h.id} />
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
