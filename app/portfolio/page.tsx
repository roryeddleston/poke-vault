import { headers } from "next/headers";
import type { PortfolioResponse } from "./types";
import { HoldingsTable } from "./_components/holdings-table";
import { SummaryCards } from "./_components/summary-cards";

async function getPortfolio(): Promise<PortfolioResponse> {
  // Server-side fetch to your own API route.
  // Use the current host so this works locally + on Vercel.
  const h = await headers();
  const host = h.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  const res = await fetch(`${protocol}://${host}/api/portfolio`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to load portfolio");

  return res.json();
}

export default async function PortfolioPage() {
  const data = await getPortfolio();

  return (
    <main className="min-h-screen bg-page text-text-main px-4 py-8">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <header className="flex items-baseline justify-between gap-4">
          <h1 className="text-2xl font-semibold">Portfolio</h1>
          <p className="text-sm text-text-muted">
            Demo data • server-rendered
          </p>
        </header>

        <SummaryCards summary={data.summary} />

        <HoldingsTable holdings={data.holdings} />
      </div>
    </main>
  );
}
