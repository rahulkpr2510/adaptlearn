'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface SaveQuizResultParams {
  track: string
  difficulty: string
  totalQuestions: number
  correctAnswers: number
  timeTakenSeconds?: number
}

// Points calculation
function calculatePoints(totalQuestions: number, correctAnswers: number, difficulty: string): number {
  const basePoints = correctAnswers * 10
  const difficultyMultiplier = 
    difficulty === 'advanced' ? 2 :
    difficulty === 'intermediate' ? 1.5 : 1
  
  const accuracyBonus = correctAnswers === totalQuestions ? 50 : 0
  
  return Math.round((basePoints * difficultyMultiplier) + accuracyBonus)
}

export async function saveQuizResult(params: SaveQuizResultParams) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const pointsEarned = calculatePoints(
    params.totalQuestions, 
    params.correctAnswers, 
    params.difficulty
  )

  try {
    // Save quiz attempt
    const { error: attemptError } = await supabase
      .from('quiz_attempts')
      .insert({
        user_id: user.id,
        track: params.track,
        difficulty: params.difficulty || 'mixed',
        total_questions: params.totalQuestions,
        correct_answers: params.correctAnswers,
        time_taken_seconds: params.timeTakenSeconds,
        points_earned: pointsEarned,
      })

    if (attemptError) {
      console.error('Error saving quiz attempt:', attemptError)
      // Continue even if this fails - profile update is more important
    }

    // Update profile stats
    const { data: profile } = await supabase
      .from('profiles')
      .select('points, quizzes_completed, questions_answered, correct_answers, current_streak, longest_streak, last_activity_date')
      .eq('id', user.id)
      .single()

    const today = new Date().toISOString().split('T')[0]
    const lastActivity = profile?.last_activity_date
    
    // Calculate streak
    let newStreak = profile?.current_streak || 0
    if (lastActivity !== today) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      
      if (lastActivity === yesterdayStr) {
        // Consecutive day - increment streak
        newStreak = (profile?.current_streak || 0) + 1
      } else if (!lastActivity) {
        // First activity ever
        newStreak = 1
      } else {
        // Streak broken - reset to 1
        newStreak = 1
      }
    }

    const newLongestStreak = Math.max(profile?.longest_streak || 0, newStreak)

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        points: (profile?.points || 0) + pointsEarned,
        quizzes_completed: (profile?.quizzes_completed || 0) + 1,
        questions_answered: (profile?.questions_answered || 0) + params.totalQuestions,
        correct_answers: (profile?.correct_answers || 0) + params.correctAnswers,
        current_streak: newStreak,
        longest_streak: newLongestStreak,
        last_activity_date: today,
      })
      .eq('id', user.id)

    if (profileError) {
      console.error('Error updating profile:', profileError)
    }

    // Update daily activity
    const { data: existingActivity } = await supabase
      .from('daily_activity')
      .select('id, quizzes_taken, points_earned')
      .eq('user_id', user.id)
      .eq('activity_date', today)
      .single()

    if (existingActivity) {
      await supabase
        .from('daily_activity')
        .update({
          quizzes_taken: existingActivity.quizzes_taken + 1,
          points_earned: existingActivity.points_earned + pointsEarned,
        })
        .eq('id', existingActivity.id)
    } else {
      await supabase
        .from('daily_activity')
        .insert({
          user_id: user.id,
          activity_date: today,
          quizzes_taken: 1,
          points_earned: pointsEarned,
        })
    }

    revalidatePath('/dashboard')
    revalidatePath('/leaderboard')

    return { 
      success: true, 
      pointsEarned,
      newStreak,
      streakIncreased: newStreak > (profile?.current_streak || 0),
    }
  } catch (error) {
    console.error('Error in saveQuizResult:', error)
    return { success: false, error: 'Failed to save quiz result' }
  }
}

export async function checkQuizLimit() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { canTakeQuiz: false, remaining: 0, limit: 3, tier: 'free' }
  }

  // Get user's subscription tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()

  const tier = profile?.subscription_tier || 'free'

  // Pro and Team have unlimited quizzes
  if (tier === 'pro' || tier === 'team') {
    return { canTakeQuiz: true, remaining: -1, limit: -1, tier }
  }

  // Check today's quiz count for free tier
  const today = new Date().toISOString().split('T')[0]
  const { data: activity } = await supabase
    .from('daily_activity')
    .select('quizzes_taken')
    .eq('user_id', user.id)
    .eq('activity_date', today)
    .single()

  const quizzesTaken = activity?.quizzes_taken || 0
  const dailyLimit = 3

  return {
    canTakeQuiz: quizzesTaken < dailyLimit,
    remaining: Math.max(0, dailyLimit - quizzesTaken),
    limit: dailyLimit,
    tier,
  }
}
