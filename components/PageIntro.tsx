import type { ReactNode } from "react";

type PageIntroProps = {
  title: string;
  subtitle?: ReactNode;
  className?: string;
};

export function PageIntro({ title, subtitle, className = "space-y-1" }: PageIntroProps) {
  return (
    <header className={className}>
      <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
      {subtitle ? <p className="text-sm text-text-muted">{subtitle}</p> : null}
    </header>
  );
}

