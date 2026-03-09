import type { ComponentProps } from "react";

export type IconProps = ComponentProps<"svg">;

export function HomeIcon(props: IconProps) {
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

export function PortfolioIcon(props: IconProps) {
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

export function CollectionIcon(props: IconProps) {
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

export function AnalyticsIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 20.5V13m4 7.5v-9m4 9V9.5M17 21v-11" stroke="currentColor" />
      <path d="M4 5.5 9.5 9l3.5-4 5 3.5" stroke="currentColor" />
      <path d="M18.5 7.5H16V5" stroke="currentColor" />
    </svg>
  );
}

export function TransfersIcon(props: IconProps) {
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

export function UserIcon(props: IconProps) {
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
      <path d="M6.5 19.5a5.5 5.5 0 0 1 11 0" stroke="currentColor" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
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

export function SearchIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="11" cy="11" r="5.5" stroke="currentColor" />
      <path d="m15.5 15.5 3 3" stroke="currentColor" />
    </svg>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="4" stroke="currentColor" />
      <path d="M12 3.5v2.5M12 18v2.5M4.75 4.75l1.8 1.8M17.45 17.45l1.8 1.8M3.5 12H6M18 12h2.5M4.75 19.25l1.8-1.8M17.45 6.55l1.8-1.8" stroke="currentColor" />
    </svg>
  );
}

export function MoonIcon(props: IconProps) {
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
        d="M19.5 14.5A7 7 0 0 1 10 4.5 7 7 0 1 0 19.5 14.5Z"
        stroke="currentColor"
      />
    </svg>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5.5 7h13" stroke="currentColor" />
      <path
        d="M10 5.5h4a1 1 0 0 1 1 1V7H9v-.5a1 1 0 0 1 1-1Z"
        stroke="currentColor"
      />
      <path
        d="M9 10v6.5M12 10v6.5M15 10v6.5"
        stroke="currentColor"
      />
      <path
        d="M7.5 7H17l-.7 10.1A1.5 1.5 0 0 1 14.8 18.5H9.2A1.5 1.5 0 0 1 7.7 17.1L7.5 7Z"
        stroke="currentColor"
      />
    </svg>
  );
}


