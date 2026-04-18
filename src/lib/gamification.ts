/**
 * Gamification utilities for AdaptLearn
 * Handles points, badges, streaks, and rankings
 */

export type Badge = 'first-quiz' | 'perfect-score' | 'streak-7' | 'streak-30' | 'topic-master' | 'leaderboard-first'

export interface UserGamification {
  total_points: number
  current_streak: number
  longest_streak: number
  badges: Badge[]
  last_activity_date: string
}

/**
 * Calculate points for a quiz attempt
 */
export function calculatePoints(score: number, topicDifficulty: number = 1): number {
  const basePoints = Math.round((score / 100) * 100 * topicDifficulty)
  const perfectionBonus = score === 100 ? 50 : 0
  return basePoints + perfectionBonus
}

/**
 * Calculate streak based on daily activity
 */
export function calculateStreak(dailyActivity: Array<{ date: string }>): {
  current: number
  longest: number
} {
  if (dailyActivity.length === 0) {
    return { current: 0, longest: 0 }
  }

  const sorted = dailyActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  let current = 0
  let longest = 0
  let tempStreak = 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let expectedDate = new Date(today)

  for (const activity of sorted) {
    const activityDate = new Date(activity.date)
    activityDate.setHours(0, 0, 0, 0)

    if (activityDate.getTime() === expectedDate.getTime()) {
      tempStreak++
      if (tempStreak > longest) longest = tempStreak
    } else if (activityDate.getTime() < expectedDate.getTime()) {
      if (current === 0) current = tempStreak
      tempStreak = 0
      expectedDate = new Date(activityDate)
    }

    expectedDate.setDate(expectedDate.getDate() - 1)
  }

  if (tempStreak === 0) {
    const lastActivityDate = new Date(sorted[0].date)
    lastActivityDate.setHours(0, 0, 0, 0)
    const daysSinceLastActivity = Math.floor((today.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysSinceLastActivity === 0) {
      current = 1
    } else if (daysSinceLastActivity === 1) {
      current = 0
    } else {
      current = 0
    }
  } else {
    current = tempStreak
  }

  return { current, longest }
}

/**
 * Award badges based on achievements
 */
export function checkBadgesEarned(userStats: {
  attempts_count: number
  perfect_scores: number
  current_streak: number
  topic_mastery: { [key: string]: number }
  total_points: number
}): Badge[] {
  const earned: Badge[] = []

  if (userStats.attempts_count === 1) {
    earned.push('first-quiz')
  }

  if (userStats.perfect_scores > 0) {
    earned.push('perfect-score')
  }

  if (userStats.current_streak >= 7) {
    earned.push('streak-7')
  }

  if (userStats.current_streak >= 30) {
    earned.push('streak-30')
  }

  const topicsWithMastery = Object.values(userStats.topic_mastery).filter(score => score >= 90)
  if (topicsWithMastery.length > 0) {
    earned.push('topic-master')
  }

  return earned
}

/**
 * Get badge display info
 */
export function getBadgeInfo(badge: Badge): {
  label: string
  description: string
  icon: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic'
} {
  const badges: Record<Badge, any> = {
    'first-quiz': {
      label: 'First Quiz',
      description: 'Completed your first quiz',
      icon: '🎯',
      rarity: 'common',
    },
    'perfect-score': {
      label: 'Perfect Score',
      description: 'Scored 100% on a quiz',
      icon: '⭐',
      rarity: 'uncommon',
    },
    'streak-7': {
      label: '7-Day Streak',
      description: 'Maintained a 7-day learning streak',
      icon: '🔥',
      rarity: 'rare',
    },
    'streak-30': {
      label: '30-Day Streak',
      description: 'Maintained a 30-day learning streak',
      icon: '🌟',
      rarity: 'epic',
    },
    'topic-master': {
      label: 'Topic Master',
      description: 'Achieved 90%+ mastery on a topic',
      icon: '👑',
      rarity: 'rare',
    },
    'leaderboard-first': {
      label: 'Leaderboard Champion',
      description: 'Reached #1 on the global leaderboard',
      icon: '🏆',
      rarity: 'epic',
    },
  }

  return badges[badge]
}

/**
 * Format points with thousands separator
 */
export function formatPoints(points: number): string {
  return points.toLocaleString()
}

/**
 * Get streak information with color
 */
export function getStreakColor(streak: number): string {
  if (streak === 0) return 'text-slate-400'
  if (streak < 3) return 'text-yellow-400'
  if (streak < 7) return 'text-orange-400'
  if (streak < 30) return 'text-red-400'
  return 'text-red-500'
}
