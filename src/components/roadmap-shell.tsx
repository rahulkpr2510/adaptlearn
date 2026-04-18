"use client";

import Link from "next/link";
import { motion } from "motion/react";

import type { RoadmapPlan } from "@/types/learning";

interface RoadmapShellProps {
  roadmap: RoadmapPlan | null;
}

export function RoadmapShell({ roadmap }: RoadmapShellProps) {
  if (!roadmap) {
    return (
      <main className="page-shell flex flex-1 flex-col gap-5 py-8 sm:py-10">
        <section className="rounded-3xl border border-white/10 bg-black/35 p-6">
          <h1 className="text-2xl font-semibold text-white">
            Roadmap not ready yet
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            Take at least one adaptive quiz to generate a personalized roadmap.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/quiz?track=dsa-interview-prep&mode=standard"
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-neutral-200"
            >
              Start Quiz
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Back to Dashboard
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell flex flex-1 flex-col gap-6 py-8 sm:py-10">
      <motion.header
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-3xl border border-white/10 bg-gradient-to-br from-neutral-950/95 to-neutral-900/70 p-6"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-400">
          Personal Roadmap
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
          Structured plan to close your weak areas
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-neutral-400 sm:text-base">
          {roadmap.summary}
        </p>

        <div className="mt-4 rounded-2xl border border-white/15 bg-white/6 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-300">
            Retest Strategy
          </p>
          <p className="mt-1 text-sm text-neutral-200">
            {roadmap.retestSuggestion}
          </p>
        </div>
      </motion.header>

      <section className="grid gap-4">
        {roadmap.priorityConcepts.map((item, index) => (
          <motion.article
            key={item.concept}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: 0.05 * index }}
            className="rounded-2xl border border-white/10 bg-black/35 p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
                  Phase {index + 1}
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-white">
                  {item.concept}
                </h2>
              </div>

              <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs font-semibold text-neutral-200">
                Mastery {Math.round(item.mastery)}%
              </span>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  Why this phase
                </p>
                <p className="mt-2 text-sm text-neutral-300">{item.whyWeak}</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  What to revise first
                </p>
                <p className="mt-2 text-sm text-neutral-300">
                  {item.whatToStudy}
                </p>
              </div>
            </div>

            {item.prerequisites.length > 0 ? (
              <div className="mt-3 rounded-xl border border-white/15 bg-white/6 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-300">
                  Prerequisites
                </p>
                <p className="mt-1 text-sm text-neutral-200">
                  {item.prerequisites.join(", ")}
                </p>
              </div>
            ) : null}

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Practice checklist
              </p>
              <ul className="mt-2 space-y-2">
                {item.practiceTasks.map((task) => (
                  <li
                    key={task}
                    className="rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-sm text-neutral-200"
                  >
                    {task}
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
              Retest checkpoint: {item.retestAfter}
            </p>
          </motion.article>
        ))}
      </section>

      <section className="rounded-2xl border border-white/10 bg-black/35 p-5">
        <h3 className="text-lg font-semibold text-white">Next actions</h3>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link
            href="/quiz?track=dsa-interview-prep&mode=standard"
            className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-neutral-200"
          >
            Start Follow-up Quiz
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Back to Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
