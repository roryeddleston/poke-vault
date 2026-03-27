import type { Holding } from "../types";
import { formatGBP } from "../utils";
import { CardImagePlaceholder } from "./card-image-placeholder";
import { CardImage } from "@/components/CardImage";
import { ChangePill } from "./change-pill";
import { GradePill } from "./grade-pill";
import { HoldingRowActions } from "./holding-row-actions";

type HoldingsTableProps = {
  holdings: Holding[];
  /** Total count when paginated; used for heading. */
  totalCount?: number;
};

/**
 * Return vs paid (%), based on current unit value vs purchase unit value.
 */
function getMonthlyChange(holding: Holding): number | null {
  const current =
    holding.pricing?.currentGbp ?? holding.snapshots[0]?.value ?? holding.purchasePrice;
  const paid = holding.purchasePrice;
  if (!Number.isFinite(paid) || paid <= 0) return null;
  return ((current - paid) / paid) * 100;
}

export function HoldingsTable({ holdings, totalCount }: HoldingsTableProps) {
  const count = totalCount ?? holdings.length;

  return (
    <section aria-labelledby="holdings-heading">
      <h2
        id="holdings-heading"
        className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted"
      >
        Holdings ({count})
      </h2>
      {/* Desktop / tablet table */}
      <div
        className="shadow-elevation-3 hidden overflow-hidden rounded-2xl border border-border-subtle bg-card md:block"
        role="region"
        aria-label="Holdings table"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] text-base">
            <thead className="border-b border-border-subtle/80 bg-surface-soft/80 text-left">
              <tr className="text-text-muted">
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-semibold uppercase tracking-wide"
                >
                  Card
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-semibold uppercase tracking-wide"
                >
                  Set
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-semibold uppercase tracking-wide"
                >
                  Condition
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide"
                >
                  Market price
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide"
                >
                  Purchase price
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide"
                >
                  Return vs paid
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h) => {
                const latest =
                  h.pricing?.currentGbp ?? h.snapshots[0]?.value ?? h.purchasePrice;
                const changeMonthly = getMonthlyChange(h);

                return (
                  <tr
                    key={h.id}
                    className="border-b border-border-subtle/70 last:border-b-0"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-8">
                        {h.imageUrl ? (
                          <CardImage
                            src={h.imageUrl}
                            alt={h.cardName}
                            className="h-24 w-16 ring-1 ring-border-subtle md:h-28 md:w-20"
                          />
                        ) : (
                          <CardImagePlaceholder
                            name={h.cardName}
                            className="h-24 w-16 ring-1 ring-border-subtle md:h-28 md:w-20"
                          />
                        )}
                        <span className="font-semibold text-text-main">
                          {h.cardName}
                          {h.cardNumber != null && h.setTotal != null ? (
                            <>
                              {" "}
                              {h.cardNumber}/{h.setTotal}
                            </>
                          ) : h.cardNumber != null ? (
                            <> {h.cardNumber}</>
                          ) : null}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex rounded-full border border-border-subtle bg-surface px-2.5 py-1 text-xs text-text-muted">
                        {h.setName}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <GradePill grade={h.grade} />
                    </td>
                    <td className="px-6 py-5 text-right font-medium tabular-nums">
                      {formatGBP(latest)}
                    </td>
                    <td className="px-6 py-5 text-right font-medium tabular-nums text-text-muted">
                      {formatGBP(h.purchasePrice)}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <ChangePill
                        value={changeMonthly}
                        periodLabel="vs paid"
                      />
                    </td>
                    <td className="px-6 py-5 text-right">
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
            const latest =
              h.pricing?.currentGbp ?? h.snapshots[0]?.value ?? h.purchasePrice;
            const changeMonthly = getMonthlyChange(h);

            return (
              <article
                key={h.id}
                className="shadow-elevation-1 flex items-center gap-8 rounded-2xl border border-border-subtle bg-card px-5 py-6 text-lg"
              >
                <CardImage
                  src={h.imageUrl}
                  alt={h.cardName}
                  className="h-24 w-16 ring-1 ring-border-subtle md:h-28 md:w-20"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="truncate text-sm font-medium text-text-main">
                      {h.cardName}
                      {h.cardNumber != null && h.setTotal != null ? (
                        <>
                          {" "}
                          {h.cardNumber}/{h.setTotal}
                        </>
                      ) : h.cardNumber != null ? (
                        <> {h.cardNumber}</>
                      ) : null}
                    </h3>
                    <span className="shrink-0 text-right">
                      <span className="block text-xs font-semibold tabular-nums">
                        {formatGBP(latest)}
                      </span>
                      <span className="block text-[11px] font-medium tabular-nums text-text-muted">
                        paid {formatGBP(h.purchasePrice)}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="rounded-full border border-border-subtle bg-surface px-2 py-0.5 text-[11px] text-text-muted">
                      {h.setName}
                    </span>
                    <GradePill grade={h.grade} />
                    <span className="ml-auto">
                      <ChangePill
                        value={changeMonthly}
                        periodLabel="vs paid"
                      />
                    </span>
                  </div>
                </div>
                <div className="self-start pt-0.5">
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
