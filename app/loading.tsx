export default function Loading() {
  return (
    <main className="min-h-screen bg-page text-text-main px-4 py-8">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="space-y-2">
          <div className="h-3 w-24 animate-pulse rounded bg-surface-soft" />
          <div className="h-8 w-72 animate-pulse rounded bg-surface-soft" />
          <div className="h-4 w-96 animate-pulse rounded bg-surface-soft" />
        </div>
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card-elevated p-4">
              <div className="h-3 w-20 animate-pulse rounded bg-surface-soft" />
              <div className="mt-2 h-6 w-24 animate-pulse rounded bg-surface-soft" />
            </div>
          ))}
        </section>
        <div className="card-elevated h-64 animate-pulse" />
      </div>
    </main>
  );
}
