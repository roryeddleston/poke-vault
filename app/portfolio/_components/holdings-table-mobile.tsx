import type { Holding } from "../types";
import { formatGBP } from "../utils";
import { CardImagePlaceholder } from "./card-image-placeholder";
import { CardImage } from "@/components/CardImage";
import { GradePill } from "./grade-pill";
import { ChangePill } from "./change-pill";
import { HoldingRowActions } from "./holding-row-actions";
import { getHoldingLatestValue, getReturnVsPaid } from "./holding-metrics";

type HoldingsTableMobileProps = {
  holdings: Holding[];
};

export function HoldingsTableMobile({
  holdings,
}: HoldingsTableMobileProps) {
  return (
    <div className="space-y-2 md:hidden">
      {holdings.length === 0 ? (
        <div className="rounded-lg border border-border-subtle bg-card px-4 py-8 text-center text-sm text-text-muted">
          No holdings yet.
        </div>
      ) : (
        holdings.map((h) => {
          const latest = getHoldingLatestValue(h);
          const returnVsPaid = getReturnVsPaid(h);

          return (
            <article
              key={h.id}
              className="shadow-elevation-1 flex items-center gap-8 rounded-2xl border border-border-subtle bg-card px-5 py-6 text-lg transition-shadow hover:shadow-elevation-2"
            >
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
                      value={returnVsPaid}
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
  );
}

