'use client'

import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

const fetcher = async (key: string) => {
  if (key.startsWith('profile:')) {
    const userId = key.split(':')[1]
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) throw error
    return data
  }

  if (key.startsWith('quiz-attempts:')) {
    const userId = key.split(':')[1]
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  }

  if (key.startsWith('leaderboard:')) {
    const type = key.split(':')[1]
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, total_points, current_streak')
      .order('total_points', { ascending: false })
      .limit(100)
    if (error) throw error
    return data
  }

  return null
}

export function useProfile(userId: string | null | undefined) {
  const { data, error, isLoading } = useSWR(userId ? `profile:${userId}` : null, fetcher)
  return { profile: data, error, isLoading }
}

export function useQuizAttempts(userId: string | null | undefined) {
  const { data, error, isLoading } = useSWR(userId ? `quiz-attempts:${userId}` : null, fetcher)
  return { attempts: data, error, isLoading }
}

export function useLeaderboard(type: 'global' | 'weekly' | 'topic' = 'global') {
  const { data, error, isLoading } = useSWR(`leaderboard:${type}`, fetcher)
  return { leaderboard: data, error, isLoading }
}
