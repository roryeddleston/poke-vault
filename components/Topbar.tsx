import { ThemeToggle } from "./ThemeToggle";
import { SearchIcon } from "./icons";

export function Topbar() {
  return (
    <div className="sticky top-0 z-30 border-b border-border-subtle bg-page/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 md:px-6">
        <form
          action="/market"
          className="flex h-10 flex-1 items-center gap-2 rounded-full border border-border-subtle bg-card px-3 text-sm text-text-muted shadow-sm"
        >
          <SearchIcon className="h-5 w-5" aria-hidden="true" />
          <input
            type="search"
            name="q"
            placeholder="Search collection or market…"
            className="w-full bg-transparent text-sm text-text-main placeholder:text-text-muted focus:outline-none"
          />
        </form>

        <ThemeToggle />
      </div>
    </div>
  );
}

