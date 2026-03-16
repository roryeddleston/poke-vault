import { ThemeToggle } from "./ThemeToggle";
import { SearchBox } from "./SearchBox";

export function Topbar() {
  return (
    <div className="sticky top-0 z-30 border-b border-border-subtle bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 md:px-6">
        <SearchBox />
        <ThemeToggle />
      </div>
    </div>
  );
}

