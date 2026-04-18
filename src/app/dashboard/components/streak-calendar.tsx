"use client"

interface DailyActivity {
  activity_date: string
  quizzes_taken: number
  points_earned: number
}

interface StreakCalendarProps {
  dailyActivity: DailyActivity[]
  currentStreak: number
  longestStreak: number
}

export function StreakCalendar({ dailyActivity, currentStreak, longestStreak }: StreakCalendarProps) {
  // Create a map of dates with activity
  const activityMap = new Map(
    dailyActivity.map(d => [d.activity_date, d])
  )

  // Generate last 28 days
  const days: { date: Date; activity: DailyActivity | null }[] = []
  for (let i = 27; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    days.push({
      date,
      activity: activityMap.get(dateStr) || null,
    })
  }

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <div className="card-surface p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Activity</h2>
        <div className="flex items-center gap-1 text-xs text-ink-soft">
          <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" />
          </svg>
          <span>{currentStreak} day streak</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-[10px] text-ink-soft py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map(({ date, activity }, index) => {
          const intensity = activity 
            ? Math.min(activity.quizzes_taken / 3, 1) 
            : 0
          
          return (
            <div
              key={index}
              className={`aspect-square rounded-sm transition-colors ${
                intensity > 0.7 
                  ? 'bg-brand' 
                  : intensity > 0.3 
                    ? 'bg-brand/60' 
                    : intensity > 0 
                      ? 'bg-brand/30' 
                      : 'bg-white/5'
              }`}
              title={`${date.toLocaleDateString()}: ${activity?.quizzes_taken || 0} quizzes`}
            />
          )
        })}
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-line">
        <div>
          <p className="text-xs text-ink-soft">Longest Streak</p>
          <p className="text-lg font-semibold">{longestStreak} days</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-ink-soft">This Month</p>
          <p className="text-lg font-semibold">
            {dailyActivity.length} active days
          </p>
        </div>
      </div>
    </div>
  )
}
