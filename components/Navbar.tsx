"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  AnalyticsIcon,
  HomeIcon,
  IconProps,
  PortfolioIcon,
  SearchIcon,
} from "./icons";

type NavItem = {
  label: string;
  href: string;
  icon: (props: IconProps) => ReactNode;
  desktopOnly?: boolean;
  mobileOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: (props) => <HomeIcon {...props} />,
  },
  {
    label: "Portfolio",
    href: "/portfolio",
    icon: (props) => <PortfolioIcon {...props} />,
  },
  {
    label: "Search",
    href: "/market",
    icon: (props) => <SearchIcon {...props} />,
  },
  {
    label: "About",
    href: "/analytics",
    icon: (props) => <AnalyticsIcon {...props} />,
  },
];

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop sidebar */}
      <nav
        aria-label="Main navigation"
        className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-border-subtle/80 bg-card/95 px-4 py-6 text-sm text-text-muted backdrop-blur md:flex"
      >
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-muted ring-1 ring-accent/20">
            <span className="text-lg font-semibold text-text-positive">PV</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-text-main">
              PokeVault
            </span>
            <span className="text-[11px] tracking-[0.08em] text-text-muted">
              Pokémon investing
            </span>
          </div>
        </div>

        <ul className="mt-8 space-y-1.5">
          {NAV_ITEMS.filter((item) => !item.mobileOnly).map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                    active
                      ? "bg-accent-muted/80 text-text-positive shadow-sm ring-1 ring-accent/15"
                      : "text-text-muted hover:bg-surface-soft/80 hover:text-text-main"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute left-1.5 h-4 w-0.5 rounded-full transition-colors ${
                      active ? "bg-accent/70" : "bg-transparent"
                    }`}
                  />
                  <item.icon
                    className={`h-5 w-5 ${
                      active
                        ? "text-accent"
                        : "text-text-muted group-hover:text-text-main"
                    }`}
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobile bottom bar */}
      <nav
        aria-label="Bottom navigation"
        className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between border-t border-border-subtle bg-card px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2 text-xs text-text-muted shadow-[0_-8px_24px_rgba(15,23,42,0.06)] md:hidden"
      >
        {NAV_ITEMS.filter((item) => !item.desktopOnly).map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center gap-1"
            >
              <item.icon
                className={`h-5 w-5 ${
                  active ? "text-accent" : "text-text-muted"
                }`}
                aria-hidden="true"
              />
              <span
                className={`text-[11px] ${
                  active ? "text-text-positive" : "text-text-muted"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}

      </nav>
    </>
  );
}
