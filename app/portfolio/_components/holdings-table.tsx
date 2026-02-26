import type { Holding } from "../types";
import { formatGBP } from "../utils";

type HoldingsTableProps = {
  holdings: Holding[];
};

export function HoldingsTable({ holdings }: HoldingsTableProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-border-subtle bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border-subtle text-left">
            <tr className="text-text-muted">
              <th className="px-4 py-3 font-medium">Card</th>
              <th className="px-4 py-3 font-medium">Set</th>
              <th className="px-4 py-3 font-medium">Grade</th>
              <th className="px-4 py-3 font-medium">Qty</th>
              <th className="px-4 py-3 font-medium">Buy</th>
              <th className="px-4 py-3 font-medium">Latest</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((h) => {
              const latest = h.snapshots[0]?.value ?? h.purchasePrice;
              return (
                <tr
                  key={h.id}
                  className="border-b border-border-subtle last:border-b-0"
                >
                  <td className="px-4 py-3 font-medium">{h.cardName}</td>
                  <td className="px-4 py-3">{h.setName}</td>
                  <td className="px-4 py-3">{h.grade}</td>
                  <td className="px-4 py-3">{h.quantity}</td>
                  <td className="px-4 py-3">{formatGBP(h.purchasePrice)}</td>
                  <td className="px-4 py-3">{formatGBP(latest)}</td>
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
    </section>
  );
}

