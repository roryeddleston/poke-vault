"use client";

type PaginationProps = {
  totalItems: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
};

export function Pagination({
  totalItems,
  pageSize,
  currentPage,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  if (totalPages <= 1) return null;

  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  const pageNumbers: number[] = [];
  const showMax = 5;
  let low = Math.max(1, currentPage - Math.floor(showMax / 2));
  let high = Math.min(totalPages, low + showMax - 1);
  if (high - low + 1 < showMax) {
    low = Math.max(1, high - showMax + 1);
  }
  for (let i = low; i <= high; i++) pageNumbers.push(i);

  return (
    <nav
      aria-label="Holdings pagination"
      className="flex flex-col items-center justify-between gap-2 border-t border-border-subtle pt-4 sm:flex-row"
    >
      <p className="text-xs text-text-muted">
        Showing {start} to {end} of {totalItems} items
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canPrev}
          aria-label="Previous page"
          className="rounded border border-border-subtle bg-card px-2.5 py-1 text-xs font-medium text-text-main transition-colors hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        {pageNumbers.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onPageChange(n)}
            aria-label={`Page ${n}`}
            aria-current={n === currentPage ? "page" : undefined}
            className={`min-w-8 rounded px-2 py-1 text-xs font-medium transition-colors ${
              n === currentPage
                ? "bg-accent text-white"
                : "border border-border-subtle bg-card text-text-main hover:bg-surface-soft"
            }`}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canNext}
          aria-label="Next page"
          className="rounded border border-border-subtle bg-card px-2.5 py-1 text-xs font-medium text-text-main transition-colors hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </nav>
  );
}
