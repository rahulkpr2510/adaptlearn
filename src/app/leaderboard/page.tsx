import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { LeaderboardTabs } from "./components/leaderboard-tabs"
import { LeaderboardTable } from "./components/leaderboard-table"
import { UserRankCard } from "./components/user-rank-card"

export const metadata = {
  title: "Leaderboard - AdaptLearn",
  description: "See how you rank against other learners",
}

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirect=/leaderboard")
  }

  // Fetch top users by points
  const { data: topByPoints } = await supabase
    .from('profiles')
    .select('id, full_name, email, points, current_streak, quizzes_completed')
    .order('points', { ascending: false })
    .limit(50)

  // Fetch top users by streak
  const { data: topByStreak } = await supabase
    .from('profiles')
    .select('id, full_name, email, points, current_streak, quizzes_completed')
    .order('current_streak', { ascending: false })
    .limit(50)

  // Get current user's profile
  const { data: currentUserProfile } = await supabase
    .from('profiles')
    .select('id, full_name, email, points, current_streak, quizzes_completed')
    .eq('id', user.id)
    .single()

  // Calculate user's rank
  const { count: usersAbove } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .gt('points', currentUserProfile?.points || 0)

  const userRank = (usersAbove || 0) + 1

  return (
    <main className="flex-1">
      <div className="page-shell py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold">Leaderboard</h1>
            <p className="text-ink-soft mt-1">
              See how you rank against other learners
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <UserRankCard 
              rank={userRank}
              profile={currentUserProfile}
            />
          </div>
          
          <div className="lg:col-span-3">
            <LeaderboardTabs 
              topByPoints={topByPoints || []}
              topByStreak={topByStreak || []}
              currentUserId={user.id}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
