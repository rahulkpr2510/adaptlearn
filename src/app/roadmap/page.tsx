"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";

import { RoadmapTimeline } from "@/components/roadmap-timeline";
import { ADAPTIVE_TRACKS, getTrack } from "@/data/adaptive-tracks";
import { getAttemptHistory, getLatestDiagnosis } from "@/lib/adaptive-storage";

function RoadmapPageContent() {
  const searchParams = useSearchParams();
  const trackParam = searchParams.get("track");
  const track = useMemo(() => getTrack(trackParam), [trackParam]);

  const diagnosis = useMemo(() => getLatestDiagnosis(track.key), [track.key]);
  const history = useMemo(() => getAttemptHistory(track.key), [track.key]);

  if (!diagnosis) {
    return (
      <main className="page-shell flex flex-1 items-center py-8 sm:py-10">
        <section className="card-surface mx-auto max-w-xl p-8 text-center">
          <h1 className="text-2xl text-foreground">
            No roadmap data for {track.label}
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            Generate a diagnosis first, then come back for personalized study
            steps.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href={`/quiz?track=${track.key}&mode=diagnostic`}
              className="btn-primary rounded-xl px-4 py-2.5 text-sm font-semibold"
            >
              Start Diagnostic Quiz
            </Link>
            <Link
              href="/"
              className="btn-secondary rounded-xl px-4 py-2.5 text-sm font-semibold"
            >
              Back to Home
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const recentScores = history
    .slice(-4)
    .map((attempt) => Math.round(attempt.diagnosis.score))
    .join(" -> ");

  return (
    <main className="page-shell flex flex-1 flex-col gap-6 py-8 sm:py-10">
      <header className="card-surface p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-soft">
          Personalized Roadmap · {track.label}
        </p>
        <h1 className="mt-2 text-3xl text-foreground sm:text-4xl">
          What to fix next and why
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-ink-soft sm:text-base">
          {diagnosis.roadmap.summary}
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.14em] text-neutral-400">
              Estimated Sessions
            </p>
            <p className="mt-1 text-lg font-semibold text-white">
              {diagnosis.roadmap.estimatedSessions}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.14em] text-neutral-400">
              Track Attempts
            </p>
            <p className="mt-1 text-lg font-semibold text-white">
              {history.length}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.14em] text-neutral-400">
              Score Trend
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {recentScores || "-"}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-white/15 bg-white/6 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-300">
            Follow-up Quiz Concepts
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {diagnosis.roadmap.followUpQuizConcepts.map((conceptId) => (
              <span
                key={conceptId}
                className="rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs font-semibold text-neutral-200"
              >
                {conceptId
                  .split("-")
                  .map(
                    (chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1),
                  )
                  .join(" ")}
              </span>
            ))}
          </div>
        </div>
      </header>

      <section>
        <RoadmapTimeline items={diagnosis.roadmap.steps} />
      </section>

      <section className="card-surface flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl text-foreground">Close the loop</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Complete these tasks, then retake a follow-up quiz to verify concept
            recovery.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/results?track=${track.key}`}
            className="btn-secondary rounded-xl px-4 py-2.5 text-sm font-semibold"
          >
            Back to Diagnosis
          </Link>
          <Link
            href={`/quiz?track=${track.key}&mode=follow-up`}
            className="btn-primary rounded-xl px-4 py-2.5 text-sm font-semibold"
          >
            Start Follow-up Quiz
          </Link>
        </div>
      </section>

      <section className="card-surface p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-soft">
          Switch Track
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {ADAPTIVE_TRACKS.map((trackOption) => (
            <Link
              key={trackOption.key}
              href={`/roadmap?track=${trackOption.key}`}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                trackOption.key === track.key
                  ? "border-white/30 bg-white/10 text-white"
                  : "border-white/15 bg-white/5 text-neutral-300"
              }`}
            >
              {trackOption.label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function RoadmapLoadingFallback() {
  return (
    <main className="page-shell flex flex-1 items-center py-8 sm:py-10">
      <section className="card-surface mx-auto w-full max-w-xl p-8 text-center">
        <p className="text-sm font-semibold text-ink-soft">
          Loading roadmap...
        </p>
      </section>
    </main>
  );
}

export default function RoadmapPage() {
  return (
    <Suspense fallback={<RoadmapLoadingFallback />}>
      <RoadmapPageContent />
    </Suspense>
  );
}
