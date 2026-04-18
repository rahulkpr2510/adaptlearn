"use client"

import Link from "next/link"
import { motion } from "motion/react"

interface CTASectionProps {
  isLoggedIn: boolean
}

export function CTASection({ isLoggedIn }: CTASectionProps) {
  return (
    <section className="py-20 md:py-28 border-t border-line">
      <div className="page-shell">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="card-surface p-8 md:p-12 text-center relative overflow-hidden"
        >
          <div className="pointer-events-none absolute -right-32 -top-32 h-64 w-64 rounded-full bg-gradient-to-br from-white/10 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-gradient-to-tr from-white/5 to-transparent blur-3xl" />
          
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">
              Ready to transform your interview prep?
            </h2>
            <p className="text-lg text-ink-soft max-w-2xl mx-auto mb-8">
              Join thousands of developers who have improved their skills and landed their dream jobs. 
              Start your journey today - completely free.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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
                    href="/pricing"
                    className="btn-secondary px-8 py-4 rounded-xl text-base font-semibold w-full sm:w-auto"
                  >
                    View Pricing
                  </Link>
                </>
              )}
            </div>
            
            <p className="mt-6 text-sm text-ink-soft">
              No credit card required. Start learning in under 60 seconds.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
