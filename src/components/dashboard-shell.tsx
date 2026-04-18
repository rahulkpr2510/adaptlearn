"use client";

import Link from "next/link";
import { motion } from "motion/react";

import type { DashboardData } from "@/lib/progress";

import { DashboardCharts } from "@/components/dashboard-charts";

interface DashboardShellProps {
  userName: string;
  data: DashboardData;
}

function StatCard({
  title,
  value,
  helper,
  delay,
}: {
  title: string;
  value: string;
  helper: string;
  delay: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="rounded-2xl border border-white/10 bg-black/35 p-5"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
        {title}
      </p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-sm text-neutral-400">{helper}</p>
    </motion.article>
  );
}

export function DashboardShell({ userName, data }: DashboardShellProps) {
  const hasAttempts = data.summary.attemptsCount > 0;

  return (
    <main className="page-shell flex flex-1 flex-col gap-6 py-8 sm:py-10">
      <motion.header
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-3xl border border-white/10 bg-gradient-to-br from-neutral-950/95 to-neutral-900/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-400">
          Analytics Dashboard
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
          {userName}, here is your learning pulse.
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-400 sm:text-base">
          Track improvement over time, inspect concept-level performance, and
          use roadmap priorities to prepare smarter for your next interview
          round.
        </p>
      </motion.header>

      {!hasAttempts ? (
        <section className="rounded-2xl border border-white/10 bg-black/35 p-6">
          <h2 className="text-xl font-semibold text-white">No progress yet</h2>
          <p className="mt-2 text-sm text-neutral-400">
            Start your first adaptive quiz to populate analytics and a
            personalized roadmap.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/quiz?track=dsa-interview-prep&mode=standard"
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-neutral-200"
            >
              Start Quiz
            </Link>
            <Link
              href="/dashboard/roadmap"
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              View Roadmap Format
            </Link>
          </div>
        </section>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Attempts"
              value={String(data.summary.attemptsCount)}
              helper="Total stored assessments"
              delay={0.05}
            />
            <StatCard
              title="Latest Mastery"
              value={`${Math.round(data.summary.latestMastery)}%`}
              helper="Most recent quiz result"
              delay={0.1}
            />
            <StatCard
              title="Average Mastery"
              value={`${Math.round(data.summary.averageMastery)}%`}
              helper="Across all attempts"
              delay={0.15}
            />
            <StatCard
              title="Consistency Streak"
              value={`${data.summary.streak}`}
              helper="Consecutive non-decreasing attempts"
              delay={0.2}
            />
          </section>

          <DashboardCharts
            trend={data.trend}
            conceptStats={data.latestConceptStats}
            masteryBands={data.masteryBands}
          />

          <section className="grid gap-4 lg:grid-cols-2">
            <motion.article
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.2 }}
              className="rounded-2xl border border-white/10 bg-black/35 p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-white">
                  Roadmap Focus
                </h2>
                <Link
                  href="/dashboard/roadmap"
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-300 hover:text-white"
                >
                  Open Full Plan
                </Link>
              </div>

              {data.latestRoadmap ? (
                <>
                  <p className="mt-3 text-sm text-neutral-400">
                    {data.latestRoadmap.summary}
                  </p>
                  <ol className="mt-4 space-y-3">
                    {data.latestRoadmap.priorityConcepts.map((item, index) => (
                      <li
                        key={item.concept}
                        className="rounded-xl border border-white/10 bg-black/25 p-3"
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                          Priority {index + 1}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-white">
                          {item.concept} · {Math.round(item.mastery)}% mastery
                        </p>
                        <p className="mt-1 text-xs text-neutral-400">
                          {item.whyWeak}
                        </p>
                      </li>
                    ))}
                  </ol>
                </>
              ) : (
                <p className="mt-3 text-sm text-neutral-400">
                  Complete one quiz to generate your roadmap.
                </p>
              )}
            </motion.article>

            <motion.article
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.25 }}
              className="rounded-2xl border border-white/10 bg-black/35 p-5"
            >
              <h2 className="text-lg font-semibold text-white">
                Recent Attempts
              </h2>
              <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 text-xs uppercase tracking-[0.14em] text-neutral-400">
                    <tr>
                      <th className="px-3 py-2">Attempt</th>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Score</th>
                      <th className="px-3 py-2">Mastery</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentAttempts.map((attempt, index) => (
                      <tr key={attempt.id} className="border-t border-white/10">
                        <td className="px-3 py-2 text-neutral-300">
                          #{index + 1}
                        </td>
                        <td className="px-3 py-2 text-neutral-400">
                          {new Date(attempt.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2 text-neutral-300">
                          {attempt.scoreLabel}
                        </td>
                        <td className="px-3 py-2 text-white">
                          {Math.round(attempt.mastery)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.article>
          </section>
        </>
      )}
    </main>
  );
}
