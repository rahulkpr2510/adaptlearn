"use client"

import Link from "next/link"
import { motion } from "motion/react"

interface HeroSectionProps {
  isLoggedIn: boolean
}

export function HeroSection({ isLoggedIn }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-64 -top-64 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-white/10 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-white/5 to-transparent blur-3xl" />
      
      <div className="page-shell py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-ink-soft mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Over 1,000 learners improving daily
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-semibold leading-tight tracking-tight text-balance"
          >
            Master coding interviews with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
              adaptive learning
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg md:text-xl text-ink-soft max-w-2xl mx-auto text-pretty"
          >
            Diagnose your weak spots, get a personalized roadmap, and track your progress. 
            Our AI-powered system adapts to how you learn.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="btn-primary px-8 py-4 rounded-xl text-base font-semibold w-full sm:w-auto"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/sign-up"
                  className="btn-primary px-8 py-4 rounded-xl text-base font-semibold w-full sm:w-auto"
                >
                  Start Learning Free
                </Link>
                <Link
                  href="/auth/login"
                  className="btn-secondary px-8 py-4 rounded-xl text-base font-semibold w-full sm:w-auto"
                >
                  Sign In
                </Link>
              </>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 grid grid-cols-3 gap-8 max-w-md mx-auto"
          >
            {[
              { value: "3", label: "Learning Tracks" },
              { value: "15+", label: "Core Concepts" },
              { value: "100%", label: "Free to Start" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl md:text-3xl font-semibold">{stat.value}</p>
                <p className="text-xs md:text-sm text-ink-soft mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
