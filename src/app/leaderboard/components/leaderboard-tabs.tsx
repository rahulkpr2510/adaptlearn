"use client"

import { useState } from "react"
import { LeaderboardTable } from "./leaderboard-table"

interface Profile {
  id: string
  full_name: string | null
  email: string
  points: number
  current_streak: number
  quizzes_completed: number
}

interface LeaderboardTabsProps {
  topByPoints: Profile[]
  topByStreak: Profile[]
  currentUserId: string
}

export function LeaderboardTabs({ topByPoints, topByStreak, currentUserId }: LeaderboardTabsProps) {
  const [activeTab, setActiveTab] = useState<'points' | 'streak'>('points')

  return (
    <div className="card-surface overflow-hidden">
      <div className="flex border-b border-line">
        <button
          onClick={() => setActiveTab('points')}
          className={`flex-1 px-6 py-4 text-sm font-medium transition ${
            activeTab === 'points'
              ? 'text-foreground border-b-2 border-brand bg-white/5'
              : 'text-ink-soft hover:text-foreground hover:bg-white/5'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Top Points
          </div>
        </button>
        <button
          onClick={() => setActiveTab('streak')}
          className={`flex-1 px-6 py-4 text-sm font-medium transition ${
            activeTab === 'streak'
              ? 'text-foreground border-b-2 border-brand bg-white/5'
              : 'text-ink-soft hover:text-foreground hover:bg-white/5'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" />
            </svg>
            Longest Streaks
          </div>
        </button>
      </div>

      <LeaderboardTable 
        data={activeTab === 'points' ? topByPoints : topByStreak}
        sortBy={activeTab}
        currentUserId={currentUserId}
      />
    </div>
  )
}
