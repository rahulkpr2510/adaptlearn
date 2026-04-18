'use server'

import { stripe } from '@/lib/stripe'
import { PRICING_PLANS } from '@/lib/products'
import { createClient } from '@/lib/supabase/server'

export async function startCheckoutSession(planId: string) {
  const plan = PRICING_PLANS.find((p) => p.id === planId)
  if (!plan || plan.priceInCents === 0) {
    throw new Error(`Invalid plan: "${planId}"`)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be logged in to subscribe')
  }

  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    redirect_on_completion: 'never',
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `AdaptLearn ${plan.name}`,
            description: plan.description,
          },
          unit_amount: plan.priceInCents,
          recurring: {
            interval: plan.interval,
          },
        },
        quantity: 1,
      },
    ],
    mode: 'subscription',
    metadata: {
      userId: user.id,
      planId: plan.id,
    },
  })

  return session.client_secret
}

export async function createPortalSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be logged in')
  }

  // Get the customer ID from the profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (!profile?.stripe_customer_id) {
    throw new Error('No subscription found')
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/settings`,
  })

  return session.url
}
