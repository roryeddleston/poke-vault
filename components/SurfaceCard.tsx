import type { ReactNode } from "react";

type SurfaceCardProps = {
  children: ReactNode;
  className?: string;
  as?: "article" | "section" | "div";
};

export function SurfaceCard({
  children,
  className = "",
  as = "section",
}: SurfaceCardProps) {
  const Component = as;
  return (
    <Component
      className={`shadow-elevation-1 rounded-2xl border border-border-subtle bg-card ${className}`.trim()}
    >
      {children}
    </Component>
  );
}

