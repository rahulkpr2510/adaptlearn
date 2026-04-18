import Link from "next/link"

interface QuickActionsProps {
  subscriptionTier: string
}

export function QuickActions({ subscriptionTier }: QuickActionsProps) {
  return (
    <div className="flex items-center gap-3">
      <Link
        href="/quiz"
        className="btn-primary px-4 py-2.5 rounded-xl text-sm font-medium inline-flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Start Quiz
      </Link>
      
      {subscriptionTier === 'free' && (
        <Link
          href="/pricing"
          className="btn-secondary px-4 py-2.5 rounded-xl text-sm font-medium inline-flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          Upgrade
        </Link>
      )}
    </div>
  )
}
