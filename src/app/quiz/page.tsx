"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";

import { QuizQuestionCard } from "@/components/quiz-question-card";
import { TrackCard } from "@/components/track-card";
import { ADAPTIVE_TRACKS, getTrack } from "@/data/adaptive-tracks";
import {
  buildDiagnosticQuiz,
  buildFollowUpQuiz,
  diagnoseQuiz,
} from "@/lib/adaptive-engine";
import {
  clearActiveQuizSession,
  getActiveQuizSession,
  getAttemptHistory,
  getLatestDiagnosis,
  getRecentQuestionIds,
  getTrackSummary,
  saveActiveQuizSession,
  saveAttemptRecord,
} from "@/lib/adaptive-storage";
import type {
  AnswerMap,
  QuizMode,
  QuizSession,
  TrackKey,
} from "@/types/adaptive";

interface QuizRunnerProps {
  trackKey: TrackKey;
  mode: QuizMode;
}

function getModeLabel(mode: QuizMode): string {
  return mode === "follow-up" ? "Follow-up" : "Diagnostic";
}

function QuizRunner({ trackKey, mode }: QuizRunnerProps) {
  const router = useRouter();
  const track = useMemo(() => getTrack(trackKey), [trackKey]);

  const [session, setSession] = useState<QuizSession | null>(() => {
    const existingSession = getActiveQuizSession();
    if (
      existingSession &&
      existingSession.trackKey === track.key &&
      existingSession.mode === mode
    ) {
      return existingSession;
    }

    return null;
  });
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const summary = useMemo(() => getTrackSummary(track.key), [track.key]);

  const currentQuestion = session?.questions[activeIndex] ?? null;
  const answeredCount = session
    ? session.questions.filter((question) => answers[question.id] !== undefined)
        .length
    : 0;

  const progress = session
    ? Math.round((answeredCount / Math.max(1, session.questions.length)) * 100)
    : 0;

  function startQuiz(): void {
    const attemptNumber = getAttemptHistory(track.key).length + 1;
    const recentQuestionIds = getRecentQuestionIds(track.key);

    try {
      const nextSession =
        mode === "follow-up"
          ? (() => {
              const latestDiagnosis = getLatestDiagnosis(track.key);
              if (!latestDiagnosis) {
                throw new Error(
                  "No prior diagnosis found for this track. Complete a diagnostic quiz first.",
                );
              }

              return buildFollowUpQuiz({
                trackKey: track.key,
                diagnosis: latestDiagnosis,
                attemptNumber,
                excludeQuestionIds: recentQuestionIds,
                questionCount: 5,
              });
            })()
          : buildDiagnosticQuiz({
              trackKey: track.key,
              attemptNumber,
              excludeQuestionIds: recentQuestionIds,
              questionCount: 10,
            });

      setSession(nextSession);
      setAnswers({});
      setActiveIndex(0);
      setError(null);
      saveActiveQuizSession(nextSession);
    } catch (startError) {
      setError(
        startError instanceof Error
          ? startError.message
          : "Unable to start quiz right now.",
      );
    }
  }

  function selectAnswer(optionIndex: number): void {
    if (!currentQuestion) {
      return;
    }

    setAnswers((previous) => ({
      ...previous,
      [currentQuestion.id]: optionIndex,
    }));
  }

  function movePrevious(): void {
    setActiveIndex((index) => Math.max(0, index - 1));
  }

  function moveNext(): void {
    if (!session) {
      return;
    }

    setActiveIndex((index) =>
      Math.min(session.questions.length - 1, index + 1),
    );
  }

  async function submitQuiz(): Promise<void> {
    if (!session) {
      return;
    }

    if (answeredCount !== session.questions.length) {
      setError("Answer all questions before submitting.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const history = getAttemptHistory(track.key);
      const diagnosis = diagnoseQuiz({
        trackKey: track.key,
        mode,
        quiz: session,
        answers,
        history,
      });

      saveAttemptRecord({
        id: `${track.key}-${Date.now()}`,
        trackKey: track.key,
        mode,
        questions: session.questions,
        answers,
        diagnosis,
        completedAt: new Date().toISOString(),
      });

      clearActiveQuizSession();
      router.push(`/results?track=${track.key}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page-shell flex flex-1 flex-col gap-5 py-8 sm:py-10">
      <header className="card-surface p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft">
              {track.label} · {getModeLabel(mode)} Quiz
            </p>
            <h1 className="mt-2 text-2xl text-foreground sm:text-3xl">
              {mode === "follow-up"
                ? "Targeted Retest Session"
                : "Concept Diagnostic Session"}
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/results?track=${track.key}`}
              className="btn-secondary rounded-xl px-3 py-2 text-sm font-semibold"
            >
              Diagnosis
            </Link>
            <Link
              href="/"
              className="btn-secondary rounded-xl px-3 py-2 text-sm font-semibold"
            >
              Home
            </Link>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.15em] text-neutral-400">
              Attempts
            </p>
            <p className="mt-1 text-lg font-semibold text-white">
              {summary.attemptCount}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.15em] text-neutral-400">
              Latest Score
            </p>
            <p className="mt-1 text-lg font-semibold text-white">
              {summary.latestScore !== null
                ? `${Math.round(summary.latestScore)}%`
                : "-"}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.15em] text-neutral-400">
              Average Score
            </p>
            <p className="mt-1 text-lg font-semibold text-white">
              {summary.averageScore !== null
                ? `${Math.round(summary.averageScore)}%`
                : "-"}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-400">
            Change Topic
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {ADAPTIVE_TRACKS.map((trackOption) => (
              <Link
                key={trackOption.key}
                href={`/quiz?track=${trackOption.key}&mode=${mode}`}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  trackOption.key === track.key
                    ? "border-white/30 bg-white/10 text-white"
                    : "border-white/15 bg-white/5 text-neutral-300 hover:border-white/25 hover:text-white"
                }`}
              >
                {trackOption.label}
              </Link>
            ))}
          </div>
        </div>

        {session ? (
          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
              <span>
                Progress {answeredCount}/{session.questions.length}
              </span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-neutral-500 to-neutral-200 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : null}
      </header>

      {!session ? (
        <section className="card-surface p-6 sm:p-7">
          <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
            {mode === "follow-up"
              ? "Start Follow-up Quiz"
              : "Start Diagnostic Quiz"}
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            {mode === "follow-up"
              ? "This quiz prioritizes weak concepts and prerequisite repairs from your latest diagnosis."
              : "You will get 10 questions with concept coverage and balanced difficulty for this track."}
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={startQuiz}
              className="btn-primary rounded-xl px-5 py-2.5 text-sm font-semibold"
            >
              {mode === "follow-up"
                ? "Generate Follow-up Quiz"
                : "Generate Diagnostic Quiz"}
            </button>

            {mode === "diagnostic" ? (
              <Link
                href={`/quiz?track=${track.key}&mode=follow-up`}
                className="btn-secondary rounded-xl px-5 py-2.5 text-sm font-semibold"
              >
                Switch to Follow-up
              </Link>
            ) : (
              <Link
                href={`/quiz?track=${track.key}&mode=diagnostic`}
                className="btn-secondary rounded-xl px-5 py-2.5 text-sm font-semibold"
              >
                Switch to Diagnostic
              </Link>
            )}
          </div>

          {error ? (
            <p className="error-surface mt-4 rounded-xl px-4 py-3 text-sm">
              {error}
            </p>
          ) : null}
        </section>
      ) : null}

      {session && currentQuestion ? (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <p className="text-sm font-semibold text-ink-soft">
              Question {activeIndex + 1} of {session.questions.length}
            </p>
            <button
              type="button"
              onClick={startQuiz}
              className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400 hover:text-white"
            >
              Regenerate Set
            </button>
          </div>

          <QuizQuestionCard
            question={currentQuestion}
            selectedOption={answers[currentQuestion.id]}
            onSelect={selectAnswer}
          />

          <div className="card-surface flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={movePrevious}
                disabled={activeIndex === 0}
                className="btn-secondary rounded-xl px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-45"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={moveNext}
                disabled={activeIndex >= session.questions.length - 1}
                className="btn-secondary rounded-xl px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-45"
              >
                Next
              </button>
            </div>

            <button
              type="button"
              onClick={() => void submitQuiz()}
              disabled={isSubmitting}
              className="btn-primary rounded-xl px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isSubmitting ? "Analyzing..." : "Submit and Diagnose"}
            </button>
          </div>

          {error ? (
            <p className="error-surface rounded-xl px-4 py-3 text-sm">
              {error}
            </p>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}

function QuizTrackPicker() {
  return (
    <main className="page-shell flex flex-1 flex-col gap-6 py-8 sm:py-10">
      <section className="card-surface p-6 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft">
          Topic Selection
        </p>
        <h1 className="mt-2 text-3xl text-foreground sm:text-4xl">
          Choose a topic to start your quiz
        </h1>
        <p className="mt-3 text-sm text-ink-soft sm:text-base">
          Switch between DSA, SQL, and JavaScript anytime. Start with a
          diagnostic quiz, then use your roadmap and follow-up quiz to close
          weak areas.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {ADAPTIVE_TRACKS.map((track) => (
          <TrackCard key={track.key} track={track} />
        ))}
      </section>
    </main>
  );
}

function QuizPageContent() {
  const searchParams = useSearchParams();
  const trackParam = searchParams.get("track") as TrackKey | null;
  const modeParam = searchParams.get("mode");
  const mode: QuizMode = modeParam === "follow-up" ? "follow-up" : "diagnostic";

  if (!trackParam) {
    return <QuizTrackPicker />;
  }

  return (
    <QuizRunner
      key={`${trackParam}:${mode}`}
      trackKey={trackParam}
      mode={mode}
    />
  );
}

function QuizLoadingFallback() {
  return (
    <main className="page-shell flex flex-1 items-center py-8 sm:py-10">
      <section className="card-surface mx-auto w-full max-w-xl p-8 text-center">
        <p className="text-sm font-semibold text-ink-soft">
          Loading quiz workspace...
        </p>
      </section>
    </main>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<QuizLoadingFallback />}>
      <QuizPageContent />
    </Suspense>
  );
}
