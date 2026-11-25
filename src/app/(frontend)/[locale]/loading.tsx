/** Instant feedback while the next page loads (matters on slow mobile data). */
export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <div className="fixed inset-x-0 top-0 z-50 h-[3px] overflow-hidden bg-gold-100">
        <div className="h-full w-1/3 animate-[ev-progress_1.1s_ease-in-out_infinite] bg-gold-500" />
      </div>
      <section className="border-b border-line bg-navy-50">
        <div className="container-page py-10 sm:py-14">
          <div className="h-4 w-40 animate-pulse rounded bg-navy-100" />
          <div className="mt-4 h-9 w-72 max-w-full animate-pulse rounded-lg bg-navy-100" />
          <div className="mt-4 h-5 w-96 max-w-full animate-pulse rounded bg-navy-100/70" />
        </div>
      </section>
      <div className="container-page grid gap-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-36 animate-pulse rounded-[var(--radius-ticket)] bg-navy-50" />
        ))}
      </div>
      <style>{`@keyframes ev-progress{0%{transform:translateX(-120%)}100%{transform:translateX(320%)}}[dir=rtl] .animate-\\[ev-progress_1\\.1s_ease-in-out_infinite\\]{animation-direction:reverse}`}</style>
    </div>
  )
}
