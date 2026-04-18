import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { StatsCards } from "./components/stats-cards"
import { ProgressChart } from "./components/progress-chart"
import { TopicMasteryGrid } from "./components/topic-mastery-grid"
import { StreakCalendar } from "./components/streak-calendar"
import { QuickActions } from "./components/quick-actions"
import { RecentActivity } from "./components/recent-activity"

export const metadata = {
  title: "Dashboard - AdaptLearn",
  description: "Track your learning progress",
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirect=/dashboard")
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch recent quiz attempts
  const { data: quizAttempts } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false })
    .limit(10)

  // Fetch daily activity for streak calendar
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const { data: dailyActivity } = await supabase
    .from('daily_activity')
    .select('*')
    .eq('user_id', user.id)
    .gte('activity_date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('activity_date', { ascending: true })

  const stats = {
    points: profile?.points ?? 0,
    currentStreak: profile?.current_streak ?? 0,
    longestStreak: profile?.longest_streak ?? 0,
    quizzesCompleted: profile?.quizzes_completed ?? 0,
    questionsAnswered: profile?.questions_answered ?? 0,
    correctAnswers: profile?.correct_answers ?? 0,
    subscriptionTier: profile?.subscription_tier ?? 'free',
  }

  const accuracy = stats.questionsAnswered > 0 
    ? Math.round((stats.correctAnswers / stats.questionsAnswered) * 100)
    : 0

  return (
    <main className="flex-1">
      <div className="page-shell py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold">
              Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
            </h1>
            <p className="text-ink-soft mt-1">
              {"Here's"} an overview of your learning progress
            </p>
          </div>
          <QuickActions subscriptionTier={stats.subscriptionTier} />
        </div>

        <StatsCards 
          points={stats.points}
          currentStreak={stats.currentStreak}
          quizzesCompleted={stats.quizzesCompleted}
          accuracy={accuracy}
        />

        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 space-y-6">
            <ProgressChart quizAttempts={quizAttempts || []} />
            <TopicMasteryGrid userId={user.id} />
          </div>
          
          <div className="space-y-6">
            <StreakCalendar 
              dailyActivity={dailyActivity || []} 
              currentStreak={stats.currentStreak}
              longestStreak={stats.longestStreak}
            />
            <RecentActivity quizAttempts={quizAttempts || []} />
          </div>
        </div>
      </div>
    </main>
  )
}
