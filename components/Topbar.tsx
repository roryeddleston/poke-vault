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

        <div className="flex items-center gap-3">
          <ThemeToggle />

          <div className="hidden items-center gap-3 rounded-full border border-border-subtle bg-card px-3 py-1.5 text-xs text-text-muted md:flex">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-muted/30 text-[11px] font-semibold text-accent">
              AK
            </div>
            <div className="leading-tight">
              <p className="text-xs font-medium text-text-main">
                Ash Ketchum
              </p>
              <p className="text-[11px] text-text-muted">Master Collector</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

