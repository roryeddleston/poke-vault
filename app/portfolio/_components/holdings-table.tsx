import type { Holding } from "../types";
import { formatGBP } from "../utils";
import { CardImagePlaceholder } from "./card-image-placeholder";
import { ChangePill } from "./change-pill";
import { GradePill } from "./grade-pill";

type HoldingsTableProps = {
  holdings: Holding[];
};

/**
 * Monthly change is not in the API yet (only latest snapshot). Pass null to show "—".
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- holding used when monthly snapshots exist
function getMonthlyChange(holding: Holding): number | null {
  return null;
}

export function HoldingsTable({ holdings }: HoldingsTableProps) {
  return (
    <section aria-labelledby="holdings-heading">
      <h2
        id="holdings-heading"
        className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted"
      >
        Holdings ({holdings.length})
      </h2>
      <div
        className="overflow-hidden rounded-lg border border-border-subtle bg-card"
        role="region"
        aria-label="Holdings table"
      >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border-subtle text-left">
            <tr className="text-text-muted">
              <th scope="col" className="px-4 py-3 font-medium">
                Card
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Set
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Grade
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-right">
                Market price
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-right">
                Monthly change
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-right">
                Total value
              </th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((h) => {
              const latest = h.snapshots[0]?.value ?? h.purchasePrice;
              const totalValue = latest * h.quantity;
              const changeMonthly = getMonthlyChange(h);

              return (
                <tr
                  key={h.id}
                  className="border-b border-border-subtle last:border-b-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <CardImagePlaceholder name={h.cardName} />
                      <span className="font-medium text-text-main">
                        {h.cardName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-surface-soft px-2 py-0.5 text-xs text-text-muted">
                      {h.setName}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <GradePill grade={h.grade} />
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatGBP(latest)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ChangePill value={changeMonthly} periodLabel="this month" />
                  </td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums text-text-main">
                    {formatGBP(totalValue)}
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
    </section>
  );
}
