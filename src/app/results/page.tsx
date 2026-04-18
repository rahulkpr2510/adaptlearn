import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Your Results | AdaptLearn',
  description: 'View your quiz results and progress',
}

export default async function ResultsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const averageScore = attempts
    ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Your Results</h1>
          <p className="text-slate-400">Track your quiz performance over time</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-slate-400 mb-2">Total Quizzes</p>
            <p className="text-3xl font-bold text-white">{attempts?.length || 0}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-slate-400 mb-2">Average Score</p>
            <p className="text-3xl font-bold text-green-400">{averageScore}%</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-slate-400 mb-2">Best Score</p>
            <p className="text-3xl font-bold text-blue-400">
              {attempts && attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : 0}%
            </p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white">Topic</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white">Score</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {attempts && attempts.length > 0 ? (
                  attempts.map(attempt => (
                    <tr key={attempt.id} className="hover:bg-slate-700/50 transition">
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {new Date(attempt.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300 capitalize">{attempt.topic}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-white">{attempt.score}%</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            attempt.score >= 80
                              ? 'bg-green-900 text-green-300'
                              : attempt.score >= 60
                                ? 'bg-yellow-900 text-yellow-300'
                                : 'bg-red-900 text-red-300'
                          }`}
                        >
                          {attempt.score >= 80 ? 'Excellent' : attempt.score >= 60 ? 'Good' : 'Needs Work'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                      No quiz results yet. <Link href="/quiz" className="text-blue-400 hover:underline">Start a quiz</Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <Link
            href="/quiz"
            className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition text-center"
          >
            Take Another Quiz
          </Link>
          <Link
            href="/dashboard"
            className="flex-1 bg-slate-700 text-white font-semibold py-3 rounded-lg hover:bg-slate-600 transition text-center"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
