"use client"

import { motion } from "motion/react"

const STEPS = [
  {
    number: "01",
    title: "Take a Diagnostic",
    description: "Start with a quick 10-question assessment. Our system analyzes your responses to map your current skill level.",
  },
  {
    number: "02",
    title: "Get Your Roadmap",
    description: "Receive a personalized learning path that prioritizes your weak areas and builds on your strengths.",
  },
  {
    number: "03",
    title: "Practice Daily",
    description: "Work through targeted exercises and quizzes. Track your streak and earn points as you improve.",
  },
  {
    number: "04",
    title: "Validate Progress",
    description: "Take follow-up assessments to confirm your improvement. Watch your mastery levels grow over time.",
  },
]

export function HowItWorksSection() {
  return (
    <section className="py-20 md:py-28 border-t border-line bg-gradient-to-b from-transparent via-white/[0.02] to-transparent">
      <div className="page-shell">
        <div className="text-center mb-16">
          <span className="section-eyebrow">How It Works</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold">
            A proven system for improvement
          </h2>
          <p className="mt-4 text-lg text-ink-soft max-w-2xl mx-auto">
            Four simple steps to transform your interview preparation
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative"
            >
              {index < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-1/2 w-full h-px bg-gradient-to-r from-white/20 to-transparent" />
              )}
              
              <div className="card-surface p-6 relative">
                <span className="text-5xl font-bold text-white/10">{step.number}</span>
                <h3 className="text-lg font-semibold mt-4 mb-2">{step.title}</h3>
                <p className="text-sm text-ink-soft">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
