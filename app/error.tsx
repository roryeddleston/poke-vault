"use client";

type ErrorPageProps = {
  error: Error;
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="min-h-screen bg-page text-text-main px-4 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <section className="card-elevated px-6 py-10 text-center">
          <p className="text-sm font-semibold text-text-main">
            Failed to load dashboard
          </p>
          <p className="mt-2 text-sm text-text-muted">
            {error.message || "An unexpected error occurred while loading data."}
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-5 inline-flex items-center rounded-full border border-border-subtle bg-surface px-4 py-2 text-xs font-medium text-text-main shadow-sm transition-colors hover:border-accent-soft hover:bg-surface-soft"
          >
            Try again
          </button>
        </section>
      </div>
    </main>
  );
}
