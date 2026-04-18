import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line/80 bg-black/45">
      <div className="page-shell py-7 sm:py-9">
        <div className="feature-surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="section-eyebrow">Built For Consistency</p>
            <h2 className="mt-2 text-2xl text-foreground sm:text-3xl">
              Run a diagnostic, get a roadmap, close the loop.
            </h2>
            <p className="mt-1 text-sm text-ink-soft sm:text-base">
              Structured prep across DSA, SQL, and JavaScript fundamentals.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/quiz"
              className="btn-primary rounded-xl px-5 py-2.5 text-sm font-semibold"
            >
              Start Quiz Workspace
            </Link>
            <Link
              href="/results?track=dsa"
              className="btn-secondary rounded-xl px-5 py-2.5 text-sm font-semibold"
            >
              Open Diagnosis
            </Link>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 text-xs text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <p>Adaptive Learning System</p>
          <p>Monochrome editorial SaaS interface</p>
        </div>
      </div>
    </footer>
  );
}
