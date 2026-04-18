import Link from "next/link"
import { PRICING_PLANS, formatPrice } from "@/lib/products"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Pricing - AdaptLearn",
  description: "Choose the perfect plan for your learning journey",
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let currentTier = 'free'
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()
    currentTier = profile?.subscription_tier || 'free'
  }

  return (
    <main className="flex-1">
      <div className="page-shell py-16">
        <div className="text-center mb-12 animate-rise">
          <span className="section-eyebrow">Pricing</span>
          <h1 className="text-4xl md:text-5xl font-semibold mt-3 mb-4">
            Choose your learning path
          </h1>
          <p className="text-lg text-ink-soft max-w-2xl mx-auto">
            Start free and upgrade as you grow. All plans include access to our adaptive learning engine.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PRICING_PLANS.map((plan, index) => {
            const isCurrentPlan = currentTier === plan.id
            const isHighlighted = plan.highlighted
            
            return (
              <div
                key={plan.id}
                className={`card-surface p-6 flex flex-col animate-rise ${
                  isHighlighted ? 'ring-2 ring-brand/50 relative' : ''
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {isHighlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-brand text-background text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-1">{plan.name}</h3>
                  <p className="text-sm text-ink-soft">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-semibold">
                    {plan.priceInCents === 0 ? 'Free' : formatPrice(plan.priceInCents)}
                  </span>
                  {plan.priceInCents > 0 && (
                    <span className="text-ink-soft text-sm ml-1">/{plan.interval}</span>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <CheckIcon />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-xl text-sm font-medium bg-white/5 text-ink-soft cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : plan.priceInCents === 0 ? (
                  user ? (
                    <Link
                      href="/dashboard"
                      className="btn-secondary w-full py-3 rounded-xl text-sm font-medium text-center"
                    >
                      Go to Dashboard
                    </Link>
                  ) : (
                    <Link
                      href="/auth/sign-up"
                      className="btn-secondary w-full py-3 rounded-xl text-sm font-medium text-center"
                    >
                      Get Started Free
                    </Link>
                  )
                ) : (
                  <Link
                    href={user ? `/checkout?plan=${plan.id}` : `/auth/sign-up?redirect=/checkout?plan=${plan.id}`}
                    className={`w-full py-3 rounded-xl text-sm font-medium text-center ${
                      isHighlighted ? 'btn-primary' : 'btn-secondary'
                    }`}
                  >
                    {user ? 'Upgrade Now' : 'Get Started'}
                  </Link>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="card-surface p-5 text-left">
              <h3 className="font-medium mb-2">Can I change plans later?</h3>
              <p className="text-sm text-ink-soft">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div className="card-surface p-5 text-left">
              <h3 className="font-medium mb-2">Is there a free trial?</h3>
              <p className="text-sm text-ink-soft">
                Our Free plan gives you unlimited access to core features. Try before you upgrade!
              </p>
            </div>
            <div className="card-surface p-5 text-left">
              <h3 className="font-medium mb-2">What payment methods do you accept?</h3>
              <p className="text-sm text-ink-soft">
                We accept all major credit cards through our secure payment processor, Stripe.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
