"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AnalyticsIcon,
  CollectionIcon,
  HomeIcon,
  IconProps,
  PlusIcon,
  PortfolioIcon,
  TransfersIcon,
  UserIcon,
} from "./icons";

type NavItem = {
  label: string;
  href: string;
  icon: (props: IconProps) => JSX.Element;
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
    label: "Collection",
    href: "/collection",
    icon: (props) => <CollectionIcon {...props} />,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: (props) => <AnalyticsIcon {...props} />,
  },
  {
    label: "Transfers",
    href: "/transfers",
    icon: (props) => <TransfersIcon {...props} />,
    desktopOnly: true,
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
        className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-zinc-800 bg-zinc-950/95 px-4 py-6 text-sm text-zinc-300 backdrop-blur md:flex"
      >
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-400/40">
            <span className="text-lg font-semibold text-emerald-300">PV</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-zinc-50">
              PokeVault Pro
            </span>
            <span className="text-xs text-zinc-500">Elite Collector</span>
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
                      ? "bg-emerald-500/10 text-emerald-300"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 ${
                      active ? "text-emerald-300" : "text-zinc-500"
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
        className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between border-t border-zinc-800 bg-zinc-950/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2 text-xs text-zinc-300 backdrop-blur md:hidden"
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
                  active ? "text-emerald-300" : "text-zinc-500"
                }`}
                aria-hidden="true"
              />
              <span
                className={`text-[11px] ${
                  active ? "text-emerald-300" : "text-zinc-400"
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

function HomeIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path
        d="M4 10.5 12 4l8 6.5V20a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 20v-9.5Z"
        stroke="currentColor"
      />
      <path d="M10 21v-5.5h4V21" stroke="currentColor" />
    </svg>
  );
}

function PortfolioIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect
        x="3.5"
        y="7"
        width="17"
        height="12.5"
        rx="2"
        stroke="currentColor"
      />
      <path
        d="M9 7V6.5A2.5 2.5 0 0 1 11.5 4h1A2.5 2.5 0 0 1 15 6.5V7"
        stroke="currentColor"
      />
      <path d="M9 12h6" stroke="currentColor" />
    </svg>
  );
}

function CollectionIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect
        x="4"
        y="3.5"
        width="9"
        height="15"
        rx="1.5"
        stroke="currentColor"
      />
      <rect
        x="11"
        y="5.5"
        width="9"
        height="15"
        rx="1.5"
        stroke="currentColor"
      />
      <path d="M8.5 8.5h2M8.5 11.5h2M8.5 14.5h2" stroke="currentColor" />
    </svg>
  );
}

function AnalyticsIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path
        d="M5 20.5V13m4 7.5v-9m4 9V9.5M17 21v-11"
        stroke="currentColor"
      />
      <path
        d="M4 5.5 9.5 9l3.5-4 5 3.5"
        stroke="currentColor"
      />
      <path
        d="M18.5 7.5H16V5"
        stroke="currentColor"
      />
    </svg>
  );
}

function TransfersIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 9h11.5L14 5.5" stroke="currentColor" />
      <path d="M18 15H6.5L10 18.5" stroke="currentColor" />
    </svg>
  );
}

function UserIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="8" r="3.25" stroke="currentColor" />
      <path
        d="M6.5 19.5a5.5 5.5 0 0 1 11 0"
        stroke="currentColor"
      />
    </svg>
  );
}

function PlusIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="8" stroke="currentColor" />
      <path d="M12 9v6M9 12h6" stroke="currentColor" />
    </svg>
  );
}
