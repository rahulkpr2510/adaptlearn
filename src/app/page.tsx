"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { TrackCard } from "@/components/track-card";
import { ADAPTIVE_TRACKS } from "@/data/adaptive-tracks";

const HERO_POINTS = [
  "Track-level diagnostics with concept granularity",
  "Deterministic scoring and explainable roadmap logic",
  "Built-in follow-up loop for measurable improvement",
];

const FEATURE_SET = [
  {
    title: "Adaptive Diagnostics",
    description:
      "Every assessment is generated with concept coverage and difficulty balancing so signal quality stays high.",
  },
  {
    title: "Concept-Level Intelligence",
    description:
      "Weak, improving, and strong buckets are computed from precise answer trails, not generic aggregate scores.",
  },
  {
    title: "Roadmap Prioritization",
    description:
      "Prerequisite gaps are promoted early, so users fix root causes before attempting complex patterns.",
  },
  {
    title: "Follow-Up Retest Mode",
    description:
      "A focused retest set validates whether weak areas recovered, giving a tight and repeatable learning loop.",
  },
  {
    title: "Local-First Reliability",
    description:
      "Core learning flow runs without external API dependency, making the experience stable during demos and testing.",
  },
  {
    title: "Track Isolation",
    description:
      "DSA, SQL, and JavaScript histories are separated, so diagnosis and roadmap remain context-aware per topic.",
  },
];

const FLOW = [
  "Choose a topic and run a 10-question diagnostic assessment.",
  "Review concept-level diagnosis with trend context from prior attempts.",
  "Execute roadmap steps arranged by weakness and prerequisite urgency.",
  "Run a 5-question follow-up quiz to verify actual improvement.",
];

const MVP_METRICS = [
  { label: "Tracks", value: "3" },
  { label: "Core Concepts", value: "15" },
  { label: "Seed Questions", value: "36" },
  { label: "Core Dependencies", value: "0 external APIs" },
];

export default function HomePage() {
  return (
    <main className="page-shell flex flex-1 flex-col gap-8 py-8 sm:py-12">
      <section className="card-surface relative overflow-hidden p-7 sm:p-9">
        <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full border border-white/10 bg-white/5 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 left-16 h-56 w-56 rounded-full border border-white/10 bg-white/5 blur-2xl" />

        <div className="hero-grid relative">
          <motion.article
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <p className="section-eyebrow">SaaS Learning Infrastructure</p>
            <h1 className="mt-3 text-4xl leading-tight text-foreground sm:text-5xl">
              A grayscale adaptive prep platform for DSA, SQL, and JavaScript.
            </h1>
            <p className="mt-4 max-w-2xl text-base text-ink-soft sm:text-lg">
              Ship interview readiness with a productized loop: diagnose,
              prioritize, practice, and validate. Built for clarity,
              repeatability, and measurable outcomes.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/quiz"
                className="btn-primary rounded-xl px-5 py-3 text-sm font-semibold"
              >
                Start Free Diagnostic
              </Link>
              <Link
                href="/results?track=dsa"
                className="btn-secondary rounded-xl px-5 py-3 text-sm font-semibold"
              >
                View Sample Diagnosis
              </Link>
            </div>

            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {HERO_POINTS.map((point) => (
                <p
                  key={point}
                  className="feature-surface px-3 py-2 text-sm text-neutral-200"
                >
                  {point}
                </p>
              ))}
            </div>
          </motion.article>

          <motion.aside
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="feature-surface p-5 sm:p-6"
          >
            <p className="section-eyebrow">Proof of System</p>
            <h2 className="mt-2 text-2xl text-foreground">
              Operational Metrics
            </h2>
            <p className="mt-2 text-sm text-ink-soft">
              Everything below is available in a local-first deterministic flow
              with no mandatory external dependency.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {MVP_METRICS.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.32, delay: index * 0.05 }}
                  className="rounded-xl border border-white/10 bg-black/35 px-4 py-3"
                >
                  <p className="text-2xl font-semibold text-foreground">
                    {metric.value}
                  </p>
                  <p className="mt-1 text-xs text-ink-soft">{metric.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.aside>
        </div>
      </section>

      <section>
        <div>
          <p className="section-eyebrow">Features</p>
          <h2 className="mt-2 text-3xl font-semibold text-foreground sm:text-4xl">
            Built like a focused SaaS product, not a one-off quiz page
          </h2>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {FEATURE_SET.map((feature, index) => (
            <motion.article
              key={feature.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.34, delay: index * 0.04 }}
              className="feature-surface p-5"
            >
              <p className="text-lg font-semibold text-foreground">
                {feature.title}
              </p>
              <p className="mt-2 text-sm text-ink-soft">
                {feature.description}
              </p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="card-surface p-6 sm:p-7">
        <p className="section-eyebrow">Workflow</p>
        <h2 className="mt-2 text-3xl font-semibold text-foreground sm:text-4xl">
          One clean cycle for continuous improvement
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FLOW.map((step, index) => (
            <div
              key={step}
              className="rounded-xl border border-white/10 bg-black/25 px-4 py-3"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">
                Step {index + 1}
              </p>
              <p className="mt-1 text-sm text-neutral-200">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div>
          <p className="section-eyebrow">Topic Selection</p>
          <h2 className="mt-2 text-3xl font-semibold text-foreground sm:text-4xl">
            Choose your topic and launch an adaptive cycle
          </h2>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {ADAPTIVE_TRACKS.map((track, index) => (
            <motion.div
              key={track.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.34, delay: index * 0.05 }}
            >
              <TrackCard track={track} />
            </motion.div>
          ))}
        </div>
      </section>

      <section className="card-surface p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="section-eyebrow">Footer CTA</p>
            <h2 className="mt-2 text-3xl font-semibold text-foreground sm:text-4xl">
              Ready to move from random practice to a repeatable system?
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-ink-soft sm:text-base">
              Start with a diagnostic quiz, let the engine isolate weak
              concepts, and close the loop with a targeted follow-up assessment.
            </p>
          </div>

          <Link
            href="/quiz"
            className="btn-primary inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold"
          >
            Launch Quiz Workspace
          </Link>
        </div>
      </section>
    </main>
  );
}
