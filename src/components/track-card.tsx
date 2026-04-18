import Link from "next/link";

import type { Track } from "@/types/adaptive";

interface TrackCardProps {
  track: Track;
}

export function TrackCard({ track }: TrackCardProps) {
  return (
    <article className="card-surface animate-rise p-6 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-soft">
            Learning Track
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-foreground">
            {track.label}
          </h3>
          <p className="mt-2 text-sm text-ink-soft">{track.description}</p>
        </div>
        <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs font-semibold text-neutral-200">
          {track.conceptIds.length} concepts
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {track.conceptIds.map((conceptId) => (
          <span
            key={conceptId}
            className="chip-surface rounded-full px-3 py-1 text-xs"
          >
            {conceptId
              .split("-")
              .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
              .join(" ")}
          </span>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/quiz?track=${track.key}&mode=diagnostic`}
          className="btn-primary inline-flex flex-1 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold"
        >
          Start Diagnostic Quiz
        </Link>
        <Link
          href={`/results?track=${track.key}`}
          className="btn-secondary inline-flex flex-1 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold"
        >
          View Latest Diagnosis
        </Link>
      </div>
    </article>
  );
}
