import Link from "next/link"

interface Profile {
  id: string
  full_name: string | null
  email: string
  points: number
  current_streak: number
  quizzes_completed: number
}

interface UserRankCardProps {
  rank: number
  profile: Profile | null
}

export function UserRankCard({ rank, profile }: UserRankCardProps) {
  if (!profile) {
    return (
      <div className="card-surface p-6">
        <p className="text-ink-soft text-center">Unable to load your rank</p>
      </div>
    )
  }

  const displayName = profile.full_name || profile.email.split('@')[0]
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="card-surface p-6 sticky top-24">
      <div className="text-center mb-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-brand/40 to-brand/10 flex items-center justify-center text-2xl font-semibold mb-4">
          {initials}
        </div>
        <h2 className="text-xl font-semibold">{displayName}</h2>
        <p className="text-sm text-ink-soft">{profile.email}</p>
      </div>

      <div className="space-y-4">
        <div className="text-center p-4 rounded-xl bg-gradient-to-br from-yellow-400/10 to-yellow-400/5 border border-yellow-400/20">
          <p className="text-xs text-ink-soft uppercase tracking-wider mb-1">Your Rank</p>
          <p className="text-4xl font-bold text-yellow-400">#{rank}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-white/5 text-center">
            <p className="text-xl font-semibold text-yellow-400">{profile.points.toLocaleString()}</p>
            <p className="text-xs text-ink-soft">Points</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 text-center">
            <p className="text-xl font-semibold text-orange-400">{profile.current_streak}</p>
            <p className="text-xs text-ink-soft">Day Streak</p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white/5 text-center">
          <p className="text-xl font-semibold">{profile.quizzes_completed}</p>
          <p className="text-xs text-ink-soft">Quizzes Completed</p>
        </div>

        <Link
          href="/quiz"
          className="btn-primary w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Climb the Ranks
        </Link>
      </div>
    </div>
  )
}
