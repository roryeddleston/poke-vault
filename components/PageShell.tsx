import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  containerClassName?: string;
  mainClassName?: string;
};

export function PageShell({
  children,
  containerClassName = "mx-auto w-full max-w-6xl space-y-6",
  mainClassName = "min-h-screen bg-page px-4 py-7 text-text-main md:px-8 lg:px-10",
}: PageShellProps) {
  return (
    <main className={mainClassName}>
      <div className={containerClassName}>{children}</div>
    </main>
  );
}

