export interface PricingPlan {
  id: string
  name: string
  description: string
  priceInCents: number
  interval: 'month' | 'year'
  features: string[]
  highlighted?: boolean
  limits: {
    quizzesPerDay: number | 'unlimited'
    tracks: string[]
    analytics: boolean
    leaderboard: boolean
    prioritySupport: boolean
  }
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    priceInCents: 0,
    interval: 'month',
    features: [
      '3 quizzes per day',
      'Access to all tracks',
      'Basic progress tracking',
      'Community leaderboard',
    ],
    limits: {
      quizzesPerDay: 3,
      tracks: ['dsa', 'sql', 'javascript'],
      analytics: false,
      leaderboard: true,
      prioritySupport: false,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For serious learners',
    priceInCents: 999,
    interval: 'month',
    highlighted: true,
    features: [
      'Unlimited quizzes',
      'Advanced analytics',
      'Detailed progress insights',
      'Priority support',
      'Custom study plans',
      'Streak protection (1 per month)',
    ],
    limits: {
      quizzesPerDay: 'unlimited',
      tracks: ['dsa', 'sql', 'javascript'],
      analytics: true,
      leaderboard: true,
      prioritySupport: true,
    },
  },
  {
    id: 'team',
    name: 'Team',
    description: 'For teams and organizations',
    priceInCents: 2999,
    interval: 'month',
    features: [
      'Everything in Pro',
      'Up to 10 team members',
      'Team analytics dashboard',
      'Admin controls',
      'Custom branding',
      'Dedicated support',
    ],
    limits: {
      quizzesPerDay: 'unlimited',
      tracks: ['dsa', 'sql', 'javascript'],
      analytics: true,
      leaderboard: true,
      prioritySupport: true,
    },
  },
]

export function getPlanById(id: string): PricingPlan | undefined {
  return PRICING_PLANS.find((plan) => plan.id === id)
}

export function formatPrice(priceInCents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(priceInCents / 100)
}
