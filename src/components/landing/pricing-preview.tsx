"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { PRICING_PLANS, formatPrice } from "@/lib/products"

export function PricingPreview() {
  return (
    <section className="py-20 md:py-28 border-t border-line">
      <div className="page-shell">
        <div className="text-center mb-16">
          <span className="section-eyebrow">Pricing</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold">
            Start free, upgrade when ready
          </h2>
          <p className="mt-4 text-lg text-ink-soft max-w-2xl mx-auto">
            No credit card required to get started. Upgrade anytime for advanced features.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PRICING_PLANS.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`card-surface p-6 flex flex-col ${
                plan.highlighted ? 'ring-2 ring-brand/50 relative' : ''
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-brand text-background text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <p className="text-sm text-ink-soft mt-1">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-semibold">
                  {plan.priceInCents === 0 ? 'Free' : formatPrice(plan.priceInCents)}
                </span>
                {plan.priceInCents > 0 && (
                  <span className="text-ink-soft text-sm ml-1">/{plan.interval}</span>
                )}
              </div>

              <ul className="space-y-3 mb-6 flex-1">
                {plan.features.slice(0, 4).map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <svg className="w-5 h-5 text-green-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.priceInCents === 0 ? '/auth/sign-up' : '/pricing'}
                className={`w-full py-3 rounded-xl text-sm font-medium text-center ${
                  plan.highlighted ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                {plan.priceInCents === 0 ? 'Get Started Free' : 'Learn More'}
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/pricing" className="text-sm text-ink-soft hover:text-foreground transition inline-flex items-center gap-1">
            View full pricing details
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
