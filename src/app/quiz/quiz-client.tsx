'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { saveQuizAttempt } from '@/app/actions/quiz'
import { ChevronRight, Lock } from 'lucide-react'

const QUIZ_DATA = {
  dsa: [
    {
      id: 'dsa1',
      question: 'What is the time complexity of binary search?',
      options: ['O(n)', 'O(log n)', 'O(n²)', 'O(n log n)'],
      correct: 1,
    },
    {
      id: 'dsa2',
      question: 'Which data structure uses LIFO?',
      options: ['Queue', 'Stack', 'Tree', 'Graph'],
      correct: 1,
    },
    {
      id: 'dsa3',
      question: 'What is the space complexity of merge sort?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
      correct: 2,
    },
  ],
  sql: [
    {
      id: 'sql1',
      question: 'What does ACID stand for in databases?',
      options: [
        'Atomicity, Consistency, Integrity, Durability',
        'Atomicity, Consistency, Isolation, Durability',
        'All, Consistency, Isolation, Durability',
        'Atomicity, Concurrency, Isolation, Durability',
      ],
      correct: 1,
    },
    {
      id: 'sql2',
      question: 'Which join returns only matching rows?',
      options: ['LEFT JOIN', 'INNER JOIN', 'OUTER JOIN', 'CROSS JOIN'],
      correct: 1,
    },
  ],
}

export default function QuizClient() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [selectedTopic, setSelectedTopic] = useState<'dsa' | 'sql' | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(true)
  const [subscriptionTier, setSubscriptionTier] = useState<string>('free')

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)
      await checkSubscription(user.id)
      setLoading(false)
    }
    checkAuth()
  }, [router])

  const checkSubscription = async (userId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single()
    setSubscriptionTier(data?.subscription_tier || 'free')
  }

  if (loading) {
    return <div className="text-white text-center py-20">Loading...</div>
  }

  if (!user) return null

  if (!selectedTopic) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Start a Quiz</h1>
          <p className="text-slate-400">Test your knowledge and improve your skills</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* DSA Quiz */}
          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 hover:border-white/20 transition">
            <h2 className="text-2xl font-bold text-white mb-4">Data Structures & Algorithms</h2>
            <p className="text-slate-300 mb-6">{QUIZ_DATA.dsa.length} questions • 5-10 minutes</p>
            <button
              onClick={() => setSelectedTopic('dsa')}
              className="w-full bg-white text-slate-900 font-semibold py-3 rounded-lg hover:bg-slate-100 transition flex items-center justify-center gap-2"
            >
              Start Quiz <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* SQL Quiz */}
          <div
            className={`bg-slate-800 rounded-lg p-8 border border-slate-700 hover:border-white/20 transition ${
              subscriptionTier === 'free' ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">SQL Fundamentals</h2>
              {subscriptionTier === 'free' && <Lock className="w-5 h-5 text-yellow-500" />}
            </div>
            <p className="text-slate-300 mb-6">{QUIZ_DATA.sql.length} questions • 5-10 minutes</p>
            <button
              onClick={() => {
                if (subscriptionTier === 'free') {
                  router.push('/pricing')
                  return
                }
                setSelectedTopic('sql')
              }}
              className={`w-full font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2 ${
                subscriptionTier === 'free'
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-white text-slate-900 hover:bg-slate-100'
              }`}
            >
              {subscriptionTier === 'free' ? 'Pro Feature' : 'Start Quiz'}{' '}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  const quizQuestions = QUIZ_DATA[selectedTopic]
  const currentQ = quizQuestions[currentQuestion]
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100

  if (showResults) {
    const correctCount = answers.filter((ans, idx) => ans === quizQuestions[idx].correct).length
    const score = Math.round((correctCount / quizQuestions.length) * 100)

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Quiz Complete!</h1>
          <div className="mb-8">
            <div className="text-6xl font-bold text-green-400 mb-2">{score}%</div>
            <p className="text-xl text-slate-300">
              You got {correctCount} out of {quizQuestions.length} questions correct
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => {
                setSelectedTopic(null)
                setCurrentQuestion(0)
                setAnswers([])
                setShowResults(false)
              }}
              className="w-full bg-white text-slate-900 font-semibold py-3 rounded-lg hover:bg-slate-100 transition"
            >
              Back to Quizzes
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-slate-700 text-white font-semibold py-3 rounded-lg hover:bg-slate-600 transition"
            >
              View Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-slate-400">
            Question {currentQuestion + 1} of {quizQuestions.length}
          </span>
          <span className="text-sm text-slate-400">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">{currentQ.question}</h2>

        <div className="space-y-3">
          {currentQ.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => {
                const newAnswers = [...answers]
                newAnswers[currentQuestion] = idx
                setAnswers(newAnswers)
              }}
              className={`w-full p-4 rounded-lg text-left font-medium transition ${
                answers[currentQuestion] === idx
                  ? 'bg-blue-600 text-white border-2 border-blue-500'
                  : 'bg-slate-700 text-slate-100 border-2 border-slate-600 hover:border-slate-500'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
        <button
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
          className="flex-1 bg-slate-700 text-white font-semibold py-3 rounded-lg hover:bg-slate-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <button
          onClick={async () => {
            if (currentQuestion === quizQuestions.length - 1) {
              await saveQuizAttempt({
                user_id: user.id,
                topic: selectedTopic,
                score: Math.round(
                  (answers.filter((ans, idx) => ans === quizQuestions[idx].correct).length /
                    quizQuestions.length) *
                    100
                ),
                answers: answers,
                total_questions: quizQuestions.length,
              })
              setShowResults(true)
            } else {
              setCurrentQuestion(currentQuestion + 1)
            }
          }}
          className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition"
        >
          {currentQuestion === quizQuestions.length - 1 ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  )
}
