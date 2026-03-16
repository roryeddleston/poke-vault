import { headers } from "next/headers";
import type { PortfolioResponse } from "./types";
import { PortfolioContent } from "./_components/portfolio-content";

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
    <main className="min-h-screen bg-page px-4 py-7 text-text-main md:px-8 lg:px-10">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <PortfolioContent data={data} />
      </div>
    </main>
  );
}
