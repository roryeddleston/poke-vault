import type { Holding } from "../types";
import { HoldingsTableDesktop } from "./holdings-table-desktop";
import { HoldingsTableMobile } from "./holdings-table-mobile";

type HoldingsTableProps = {
  holdings: Holding[];
  /** Total count when paginated; used for heading. */
  totalCount?: number;
};

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
      <HoldingsTableDesktop holdings={holdings} />
      <HoldingsTableMobile holdings={holdings} />
    </section>
  );
}
