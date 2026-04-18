import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { PRICING_PLANS, formatPrice, getPlanById } from "@/lib/products"

export const metadata = {
  title: "Billing - AdaptLearn",
  description: "Manage your subscription and billing",
}

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirect=/billing")
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_status, stripe_customer_id')
    .eq('id', user.id)
    .single()

  const currentTier = profile?.subscription_tier || 'free'
  const currentPlan = getPlanById(currentTier)
  const subscriptionStatus = profile?.subscription_status || 'inactive'

  return (
    <main className="flex-1">
      <div className="page-shell py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-semibold mb-8">Billing & Subscription</h1>

          <div className="space-y-6">
            <div className="card-surface p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">Current Plan</h2>
                  <p className="text-sm text-ink-soft">
                    {currentPlan?.description || 'Free tier with limited features'}
                  </p>
                </div>
                {currentTier !== 'free' && (
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    subscriptionStatus === 'active' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {subscriptionStatus === 'active' ? 'Active' : 'Inactive'}
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-semibold">{currentPlan?.name || 'Free'}</span>
                {currentPlan && currentPlan.priceInCents > 0 && (
                  <span className="text-ink-soft">
                    {formatPrice(currentPlan.priceInCents)}/{currentPlan.interval}
                  </span>
                )}
              </div>

              {currentTier === 'free' ? (
                <Link
                  href="/pricing"
                  className="btn-primary px-6 py-2.5 rounded-xl text-sm font-medium inline-flex"
                >
                  Upgrade Plan
                </Link>
              ) : (
                <div className="flex gap-3">
                  <Link
                    href="/pricing"
                    className="btn-secondary px-4 py-2 rounded-xl text-sm font-medium"
                  >
                    Change Plan
                  </Link>
                  <button
                    className="px-4 py-2 rounded-xl text-sm font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 transition"
                  >
                    Cancel Subscription
                  </button>
                </div>
              )}
            </div>

            <div className="card-surface p-6">
              <h2 className="text-lg font-semibold mb-4">Plan Features</h2>
              <ul className="space-y-3">
                {currentPlan?.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <svg className="w-5 h-5 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {currentTier === 'free' && (
              <div className="card-surface p-6 border-brand/30">
                <h2 className="text-lg font-semibold mb-2">Upgrade to Pro</h2>
                <p className="text-sm text-ink-soft mb-4">
                  Get unlimited quizzes, advanced analytics, and priority support.
                </p>
                <Link
                  href="/checkout?plan=pro"
                  className="btn-primary px-6 py-2.5 rounded-xl text-sm font-medium inline-flex"
                >
                  Upgrade to Pro - {formatPrice(999)}/month
                </Link>
              </div>
            )}

            <div className="card-surface p-6">
              <h2 className="text-lg font-semibold mb-4">Billing History</h2>
              {currentTier === 'free' ? (
                <p className="text-sm text-ink-soft">
                  No billing history yet. Upgrade to a paid plan to see invoices.
                </p>
              ) : (
                <p className="text-sm text-ink-soft">
                  Contact support to access your billing history.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
