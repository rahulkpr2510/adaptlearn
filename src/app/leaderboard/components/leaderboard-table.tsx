interface Profile {
  id: string
  full_name: string | null
  email: string
  points: number
  current_streak: number
  quizzes_completed: number
}

interface LeaderboardTableProps {
  data: Profile[]
  sortBy: 'points' | 'streak'
  currentUserId: string
}

function getRankBadge(rank: number) {
  if (rank === 1) return { icon: '1', color: 'bg-yellow-400 text-black' }
  if (rank === 2) return { icon: '2', color: 'bg-gray-300 text-black' }
  if (rank === 3) return { icon: '3', color: 'bg-amber-600 text-white' }
  return { icon: rank.toString(), color: 'bg-white/10 text-foreground' }
}

export function LeaderboardTable({ data, sortBy, currentUserId }: LeaderboardTableProps) {
  if (data.length === 0) {
    return (
      <div className="p-12 text-center">
        <p className="text-ink-soft">No data available yet</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-line text-left">
            <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink-soft">Rank</th>
            <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink-soft">User</th>
            <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink-soft text-right">
              {sortBy === 'points' ? 'Points' : 'Streak'}
            </th>
            <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink-soft text-right hidden md:table-cell">
              Quizzes
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line/50">
          {data.map((profile, index) => {
            const rank = index + 1
            const badge = getRankBadge(rank)
            const isCurrentUser = profile.id === currentUserId
            const displayName = profile.full_name || profile.email.split('@')[0]
            const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

            return (
              <tr 
                key={profile.id}
                className={`transition hover:bg-white/5 ${isCurrentUser ? 'bg-brand/5' : ''}`}
              >
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${badge.color}`}>
                    {badge.icon}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand/30 to-brand/10 flex items-center justify-center text-sm font-semibold">
                      {initials}
                    </div>
                    <div>
                      <p className={`font-medium ${isCurrentUser ? 'text-brand' : ''}`}>
                        {displayName}
                        {isCurrentUser && <span className="ml-2 text-xs text-ink-soft">(You)</span>}
                      </p>
                      {profile.current_streak > 0 && sortBy === 'points' && (
                        <p className="text-xs text-ink-soft flex items-center gap-1">
                          <svg className="w-3 h-3 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" />
                          </svg>
                          {profile.current_streak} day streak
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`text-lg font-semibold ${sortBy === 'points' ? 'text-yellow-400' : 'text-orange-400'}`}>
                    {sortBy === 'points' 
                      ? profile.points.toLocaleString()
                      : `${profile.current_streak} days`
                    }
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-ink-soft hidden md:table-cell">
                  {profile.quizzes_completed}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
