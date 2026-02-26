"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  AnalyticsIcon,
  HomeIcon,
  IconProps,
  PlusIcon,
  PortfolioIcon,
  UserIcon,
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
    label: "Analytics",
    href: "/analytics",
    icon: (props) => <AnalyticsIcon {...props} />,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: (props) => <UserIcon {...props} />,
    mobileOnly: true,
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
        className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-border-subtle bg-surface px-4 py-6 text-sm text-text-muted backdrop-blur md:flex"
      >
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-400/40">
            <span className="text-lg font-semibold text-emerald-300">PV</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-text-main">
              PokeVault Pro
            </span>
            <span className="text-xs text-text-muted">Elite Collector</span>
          </div>
        </div>

        <ul className="mt-8 space-y-1">
          {NAV_ITEMS.filter((item) => !item.mobileOnly).map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? "bg-accent-muted/20 text-accent"
                      : "text-text-muted hover:bg-surface-soft hover:text-text-main"
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 ${
                      active ? "text-accent" : "text-text-muted"
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
        className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between border-t border-border-subtle bg-surface px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2 text-xs text-text-muted backdrop-blur md:hidden"
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
                  active ? "text-accent" : "text-text-muted"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Center add button, non-routing, for visual parity with design */}
        <button
          type="button"
          aria-label="Add card"
          className="absolute -top-5 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/40"
        >
          <PlusIcon className="h-6 w-6" aria-hidden="true" />
        </button>
      </nav>
    </>
  );
}
