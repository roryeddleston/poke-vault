import "server-only";

import { DEMO_OWNER_ID } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import {
  summarizeValuedHoldings,
  toPortfolioApiHoldings,
  valuePortfolioHoldings,
} from "@/lib/portfolio-valuation";

import type { PortfolioResponse } from "@/app/portfolio/types";

export async function getPortfolioResponse(): Promise<PortfolioResponse> {
  const holdings = await prisma.holding.findMany({
    where: { ownerId: DEMO_OWNER_ID },
    orderBy: { createdAt: "desc" },
    include: {
      snapshots: {
        orderBy: { capturedAt: "desc" },
        take: 1,
      },
    },
  });

  const pricedRows = await valuePortfolioHoldings(holdings);
  const summary = summarizeValuedHoldings(pricedRows);
  const cleanedHoldings = toPortfolioApiHoldings(pricedRows);

  // Match `NextResponse.json` / client fetch: Prisma `Date` → ISO strings.
  return JSON.parse(
    JSON.stringify({ holdings: cleanedHoldings, summary }),
  ) as PortfolioResponse;
}
