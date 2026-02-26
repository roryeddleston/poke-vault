import { ThemeToggle } from "./ThemeToggle";
import { SearchIcon } from "./icons";

export function Topbar() {
  return (
    <div className="sticky top-0 z-30 border-b border-border-subtle bg-page/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 md:px-6">
        <form className="flex flex-1 items-center gap-2 rounded-full border border-border-subtle bg-card px-3 py-1.5 text-sm text-text-muted shadow-sm">
          <SearchIcon className="h-4 w-4" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search collection or market…"
            className="w-full bg-transparent text-xs text-text-main placeholder:text-text-muted focus:outline-none"
          />
        </form>

        <ThemeToggle />
      </div>
    </div>
  );
}

