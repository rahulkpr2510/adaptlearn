"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";

import { ConceptPerformanceBar } from "@/components/concept-performance-bar";
import { ADAPTIVE_TRACKS, getTrack } from "@/data/adaptive-tracks";
import {
  getAttemptHistory,
  getLatestDiagnosis,
  getTrackSummary,
} from "@/lib/adaptive-storage";

function StatusPill({
  title,
  tone,
}: {
  title: string;
  tone: "good" | "warn" | "bad";
}) {
  const palette =
    tone === "good"
      ? "bg-white/12 text-neutral-100"
      : tone === "warn"
        ? "bg-neutral-600/45 text-neutral-200"
        : "bg-neutral-700/55 text-neutral-300";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${palette}`}>
      {title}
    </span>
  );
}

function ResultsPageContent() {
  const searchParams = useSearchParams();
  const trackParam = searchParams.get("track");
  const track = useMemo(() => getTrack(trackParam), [trackParam]);

  const diagnosis = useMemo(() => getLatestDiagnosis(track.key), [track.key]);
  const summary = useMemo(() => getTrackSummary(track.key), [track.key]);
  const history = useMemo(() => getAttemptHistory(track.key), [track.key]);

  if (!diagnosis) {
    return (
      <main className="page-shell flex flex-1 items-center py-8 sm:py-10">
        <section className="card-surface mx-auto max-w-xl p-8 text-center">
          <h1 className="text-2xl text-foreground">
            No diagnosis found for {track.label}
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            Complete a diagnostic quiz to unlock concept breakdown, confidence
            summary, and roadmap.
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

  const trendTone =
    diagnosis.trend.deltaScore > 0
      ? "text-neutral-100"
      : diagnosis.trend.deltaScore < 0
        ? "text-neutral-400"
        : "text-neutral-300";

  return (
    <main className="page-shell flex flex-1 flex-col gap-6 py-8 sm:py-10">
      <header className="card-surface p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-soft">
              Diagnosis Dashboard · {track.label}
            </p>
            <h1 className="mt-2 text-3xl text-foreground sm:text-4xl">
              Performance Snapshot
            </h1>
            <p className="mt-2 text-sm text-ink-soft">
              {diagnosis.correctCount} correct out of {diagnosis.totalQuestions}{" "}
              questions.
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-black/30 px-5 py-4 text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
              Score
            </p>
            <p className="text-3xl font-semibold text-white">
              {Math.round(diagnosis.score)}%
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.14em] text-neutral-400">
              Attempts
            </p>
            <p className="mt-1 text-lg font-semibold text-white">
              {summary.attemptCount}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.14em] text-neutral-400">
              Average Score
            </p>
            <p className="mt-1 text-lg font-semibold text-white">
              {summary.averageScore !== null
                ? `${Math.round(summary.averageScore)}%`
                : "-"}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.14em] text-neutral-400">
              Trend
            </p>
            <p className={`mt-1 text-lg font-semibold ${trendTone}`}>
              {diagnosis.trend.deltaScore > 0 ? "+" : ""}
              {Math.round(diagnosis.trend.deltaScore)}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-white/15 bg-white/6 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-300">
            Confidence Summary
          </p>
          <p className="mt-1 text-sm text-neutral-200">
            {diagnosis.confidenceSummary}
          </p>
          <p className="mt-2 text-sm text-neutral-200">
            Next best focus:{" "}
            <span className="font-semibold">{diagnosis.nextBestFocus}</span>
          </p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="card-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-soft">
            Strong Concepts
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {diagnosis.strongConcepts.length > 0 ? (
              diagnosis.strongConcepts.map((concept) => (
                <StatusPill key={concept} title={concept} tone="good" />
              ))
            ) : (
              <p className="text-sm text-ink-soft">No strong concepts yet.</p>
            )}
          </div>
        </article>

        <article className="card-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-soft">
            Improving Concepts
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {diagnosis.improvingConcepts.length > 0 ? (
              diagnosis.improvingConcepts.map((concept) => (
                <StatusPill key={concept} title={concept} tone="warn" />
              ))
            ) : (
              <p className="text-sm text-ink-soft">
                No improving concepts yet.
              </p>
            )}
          </div>
        </article>

        <article className="card-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-soft">
            Weak Concepts
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {diagnosis.weakConcepts.length > 0 ? (
              diagnosis.weakConcepts.map((concept) => (
                <StatusPill key={concept} title={concept} tone="bad" />
              ))
            ) : (
              <p className="text-sm text-ink-soft">
                No weak concepts in latest attempt.
              </p>
            )}
          </div>
        </article>
      </section>

      <section className="card-surface p-6 sm:p-7">
        <h2 className="text-2xl text-foreground">Concept Performance</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Each concept score is calculated from your latest quiz, with
          prerequisite-gap detection.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {diagnosis.conceptPerformance.map((stat) => (
            <ConceptPerformanceBar key={stat.conceptId} stat={stat} />
          ))}
        </div>
      </section>

      <section className="card-surface p-6 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl text-white">Recent Attempt History</h3>
            <p className="mt-1 text-sm text-ink-soft">
              The roadmap uses recurrence patterns from your previous attempts.
            </p>
          </div>
          <Link
            href={`/quiz?track=${track.key}&mode=diagnostic`}
            className="btn-secondary rounded-xl px-4 py-2.5 text-sm font-semibold"
          >
            Retake Diagnostic
          </Link>
        </div>

        <div className="mt-4 grid gap-2">
          {history
            .slice(-5)
            .reverse()
            .map((attempt, index) => (
              <div
                key={attempt.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-black/25 px-3 py-2"
              >
                <p className="text-sm text-foreground">
                  Attempt {history.length - index} ·{" "}
                  {attempt.mode === "follow-up" ? "Follow-up" : "Diagnostic"}
                </p>
                <p className="text-sm font-semibold text-white">
                  {Math.round(attempt.diagnosis.score)}%
                </p>
              </div>
            ))}
        </div>
      </section>

      <section className="card-surface flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl text-white">Continue your adaptive loop</h3>
          <p className="mt-1 text-sm text-ink-soft">
            Move to roadmap for action steps, then run a follow-up quiz to
            verify improvement.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/roadmap?track=${track.key}`}
            className="btn-primary rounded-xl px-4 py-2.5 text-sm font-semibold"
          >
            Open Roadmap
          </Link>
          <Link
            href={`/quiz?track=${track.key}&mode=follow-up`}
            className="btn-secondary rounded-xl px-4 py-2.5 text-sm font-semibold"
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
              href={`/results?track=${trackOption.key}`}
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

function ResultsLoadingFallback() {
  return (
    <main className="page-shell flex flex-1 items-center py-8 sm:py-10">
      <section className="card-surface mx-auto w-full max-w-xl p-8 text-center">
        <p className="text-sm font-semibold text-ink-soft">
          Loading diagnosis dashboard...
        </p>
      </section>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<ResultsLoadingFallback />}>
      <ResultsPageContent />
    </Suspense>
  );
}
