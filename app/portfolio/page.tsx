import { PortfolioContent } from "./_components/portfolio-content";
import { PageShell } from "@/components/PageShell";
import { getPortfolioResponse } from "@/lib/get-portfolio-response";

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const data = await getPortfolioResponse();

  return (
    <PageShell>
      <PortfolioContent data={data} />
    </PageShell>
  );
}
