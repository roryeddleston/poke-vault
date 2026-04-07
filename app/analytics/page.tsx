import {
  FiBarChart2,
  FiCheckSquare,
  FiCode,
  FiDatabase,
  FiGrid,
  FiLayers,
  FiRefreshCw,
  FiSearch,
  FiShare2,
  FiSettings,
} from "react-icons/fi";
import {
  SiEslint,
  SiNextdotjs,
  SiPrisma,
  SiPostgresql,
  SiReact,
  SiSqlite,
  SiTailwindcss,
  SiTypescript,
} from "react-icons/si";
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
        title="How it works"
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

      <section className="space-y-6 sm:space-y-7">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight text-text-main sm:text-2xl">
            Tech stack
          </h2>
          <p className="max-w-3xl text-base leading-relaxed text-text-muted">
            A modular Next.js app with shared UI primitives and typed value logic,
            powered by the TCGdex API and Prisma.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:gap-7 md:grid-cols-2 xl:grid-cols-4">
          <TechStackGroup
            title="Frontend"
            items={[
              { label: "Next.js (App Router)", icon: <SiNextdotjs className="h-5 w-5" /> },
              { label: "React", icon: <SiReact className="h-5 w-5" /> },
              { label: "TypeScript", icon: <SiTypescript className="h-5 w-5" /> },
              { label: "Tailwind CSS", icon: <SiTailwindcss className="h-5 w-5" /> },
            ]}
          />
          <TechStackGroup
            title="Backend and data"
            items={[
              { label: "Next.js API Routes", icon: <SiNextdotjs className="h-5 w-5" /> },
              { label: "Prisma ORM", icon: <SiPrisma className="h-5 w-5" /> },
              {
                label: "PostgreSQL/SQLite",
                icon: (
                  <span className="inline-flex items-center gap-1.5">
                    <SiPostgresql className="h-5 w-5" />
                    <SiSqlite className="h-5 w-5" />
                  </span>
                ),
              },
              { label: "TCGdex API", icon: <FiDatabase className="h-5 w-5" /> },
            ]}
          />
          <TechStackGroup
            title="Architecture"
            items={[
              { label: "Reusable page primitives", icon: <FiLayers className="h-5 w-5" /> },
              { label: "Typed DTO mapping", icon: <FiCode className="h-5 w-5" /> },
              { label: "Shared valuation logic", icon: <FiShare2 className="h-5 w-5" /> },
              { label: "Composable UI components", icon: <FiLayers className="h-5 w-5" /> },
            ]}
          />
          <TechStackGroup
            title="Developer workflow"
            items={[
              { label: "ESLint", icon: <SiEslint className="h-5 w-5" /> },
              { label: "Modular component structure", icon: <FiGrid className="h-5 w-5" /> },
              { label: "Progressive refactoring", icon: <FiRefreshCw className="h-5 w-5" /> },
              { label: "Accessible UI patterns", icon: <FiCheckSquare className="h-5 w-5" /> },
            ]}
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight text-text-main sm:text-2xl">
              User flow
            </h2>
          </div>
        </div>

        <div className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-0 right-0 top-8 hidden h-px bg-accent/20 lg:block"
          />
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-4">
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
        </div>
      </section>
    </PageShell>
  );
}
