import type { Holding } from "../types";
import { formatGBP } from "../utils";
import { CardImagePlaceholder } from "./card-image-placeholder";
import { CardImage } from "@/components/CardImage";
import { ChangePill } from "./change-pill";
import { GradePill } from "./grade-pill";
import { HoldingRowActions } from "./holding-row-actions";
import { getHoldingLatestValue, getReturnVsPaid } from "./holding-metrics";

type HoldingsTableDesktopProps = {
  holdings: Holding[];
};

export function HoldingsTableDesktop({
  holdings,
}: HoldingsTableDesktopProps) {
  return (
    <div
      className="shadow-elevation-3 hidden overflow-hidden rounded-2xl border border-border-subtle bg-card md:block"
      role="region"
      aria-label="Holdings table"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1040px] text-base">
          <thead className="sticky top-0 border-b border-emerald-600/40 bg-surface-soft/40 backdrop-blur text-left">
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
                Grade
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide"
              >
                Cost
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
                Return %
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
              const latest = getHoldingLatestValue(h);
              const returnVsPaid = getReturnVsPaid(h);

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
                  <td className="px-6 py-5 text-right font-medium tabular-nums text-text-muted">
                    {formatGBP(h.purchasePrice)}
                  </td>
                  <td className="px-6 py-5 text-right font-medium tabular-nums">
                    {formatGBP(latest)}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <ChangePill value={returnVsPaid} periodLabel="vs paid" />
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
                  colSpan={7}
                >
                  No holdings yet. Add cards from the portfolio controls above or from
                  the Search page.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

