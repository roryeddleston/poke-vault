import { FiBarChart2, FiDatabase, FiSearch, FiSettings } from "react-icons/fi";
import { PageIntro } from "@/components/PageIntro";
import { PageShell } from "@/components/PageShell";
import { SurfaceCard } from "@/components/SurfaceCard";
import { ProcessStepCard } from "./_components/process-step-card";
import { TechStackGroup } from "./_components/tech-stack-group";

const PROCESS_STEPS = [
  {
    step: "Step 1",
    title: "Search cards fast",
    description:
      "Use the global search bar to find cards by name or number (for example 60/64 or 4/102). Results are pulled from the TCG database and normalized for consistent matching.",
    icon: <FiSearch className="h-4 w-4" aria-hidden="true" />,
  },
  {
    step: "Step 2",
    title: "Track each holding",
    description:
      "Add cards to your portfolio with grade, finish, edition, quantity, and purchase price. Each entry is stored as a holding so the app can track value and return over time.",
    icon: <FiDatabase className="h-4 w-4" aria-hidden="true" />,
  },
  {
    step: "Step 3",
    title: "Review performance",
    description:
      "The dashboard and portfolio views summarize total value, profit/loss, allocation, and movers. This helps you quickly understand where your collection is growing or lagging.",
    icon: <FiBarChart2 className="h-4 w-4" aria-hidden="true" />,
  },
];

export default function AnalyticsPage() {
  return (
    <PageShell>
      <PageIntro
        title="How PokeVault works"
        subtitle="A clear overview of what this project does, how users should use it, and the technology stack behind it."
      />

      <SurfaceCard className="p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle bg-surface text-accent">
            <FiSettings className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-text-main">
              Project goal
            </h2>
            <p className="text-sm leading-6 text-text-muted">
              PokeVault is a portfolio-style Pokemon card tracker. It helps users
              discover cards, add them to holdings, and monitor value, returns,
              and allocation in a modern dashboard experience.
            </p>
          </div>
        </div>
      </SurfaceCard>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-text-main">User flow</h2>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {PROCESS_STEPS.map((step) => (
            <ProcessStepCard
              key={step.step}
              step={step.step}
              title={step.title}
              description={step.description}
              icon={step.icon}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-text-main">Tech stack</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <TechStackGroup
            title="Frontend"
            items={["Next.js (App Router)", "React", "TypeScript", "Tailwind CSS"]}
          />
          <TechStackGroup
            title="Backend and data"
            items={["Next.js API Routes", "Prisma ORM", "PostgreSQL/SQLite", "TCGdex API"]}
          />
          <TechStackGroup
            title="Architecture"
            items={["Reusable page primitives", "Typed DTO mapping", "Shared valuation logic", "Composable UI components"]}
          />
          <TechStackGroup
            title="Developer workflow"
            items={["ESLint", "Modular component structure", "Progressive refactoring", "Accessible UI patterns"]}
          />
        </div>
      </section>
    </PageShell>
  );
}
