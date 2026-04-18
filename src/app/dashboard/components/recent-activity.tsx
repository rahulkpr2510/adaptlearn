import Link from "next/link"

interface QuizAttempt {
  id: string
  track: string
  total_questions: number
  correct_answers: number
  points_earned: number
  completed_at: string
}

interface RecentActivityProps {
  quizAttempts: QuizAttempt[]
}

const TRACK_LABELS = {
  dsa: 'DSA',
  sql: 'SQL',
  javascript: 'JavaScript',
}

export function RecentActivity({ quizAttempts }: RecentActivityProps) {
  const recentAttempts = quizAttempts.slice(0, 5)

  return (
    <div className="card-surface p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        {quizAttempts.length > 0 && (
          <Link href="/results" className="text-xs text-ink-soft hover:text-foreground transition">
            View all
          </Link>
        )}
      </div>

      {recentAttempts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-ink-soft mb-4">No activity yet</p>
          <Link
            href="/quiz"
            className="btn-secondary px-4 py-2 rounded-lg text-sm font-medium inline-flex"
          >
            Take your first quiz
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {recentAttempts.map((attempt) => {
            const accuracy = Math.round((attempt.correct_answers / attempt.total_questions) * 100)
            const timeAgo = getTimeAgo(new Date(attempt.completed_at))
            
            return (
              <div 
                key={attempt.id}
                className="flex items-center justify-between py-2 border-b border-line/50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold ${
                    accuracy >= 80 
                      ? 'bg-green-500/20 text-green-400' 
                      : accuracy >= 50 
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                  }`}>
                    {accuracy}%
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {TRACK_LABELS[attempt.track as keyof typeof TRACK_LABELS] || attempt.track} Quiz
                    </p>
                    <p className="text-xs text-ink-soft">
                      {attempt.correct_answers}/{attempt.total_questions} correct
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-yellow-400">+{attempt.points_earned}</p>
                  <p className="text-xs text-ink-soft">{timeAgo}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'Just now'
}
