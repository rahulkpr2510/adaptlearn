"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Suspense } from "react"
import Checkout from "@/components/checkout"
import { PRICING_PLANS, formatPrice, getPlanById } from "@/lib/products"

function CheckoutContent() {
  const searchParams = useSearchParams()
  const planId = searchParams.get("plan")
  
  const plan = planId ? getPlanById(planId) : null

  if (!plan || plan.priceInCents === 0) {
    return (
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="card-surface p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-semibold mb-4">Invalid Plan</h1>
          <p className="text-ink-soft mb-6">
            Please select a valid plan to continue.
          </p>
          <Link
            href="/pricing"
            className="btn-primary inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-medium"
          >
            View Pricing
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1">
      <div className="page-shell py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link href="/pricing" className="text-sm text-ink-soft hover:text-foreground transition flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Pricing
            </Link>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <div className="card-surface p-6 sticky top-24">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                
                <div className="border-b border-line pb-4 mb-4">
                  <h3 className="font-medium">{plan.name} Plan</h3>
                  <p className="text-sm text-ink-soft mt-1">{plan.description}</p>
                </div>

                <ul className="space-y-2 mb-4">
                  {plan.features.slice(0, 4).map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-ink-soft">
                      <svg className="w-4 h-4 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="border-t border-line pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-ink-soft">Total</span>
                    <div className="text-right">
                      <span className="text-2xl font-semibold">{formatPrice(plan.priceInCents)}</span>
                      <span className="text-ink-soft text-sm">/{plan.interval}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="card-surface p-6">
                <h2 className="text-lg font-semibold mb-4">Payment Details</h2>
                <Checkout planId={plan.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <main className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-ink-soft">Loading checkout...</div>
      </main>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
