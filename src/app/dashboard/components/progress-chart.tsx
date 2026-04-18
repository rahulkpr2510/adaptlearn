"use client"

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

interface QuizAttempt {
  id: string
  track: string
  total_questions: number
  correct_answers: number
  points_earned: number
  completed_at: string
}

interface ProgressChartProps {
  quizAttempts: QuizAttempt[]
}

export function ProgressChart({ quizAttempts }: ProgressChartProps) {
  // Group by date and calculate average accuracy
  const dataByDate = quizAttempts.reduce((acc, attempt) => {
    const date = new Date(attempt.completed_at).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
    if (!acc[date]) {
      acc[date] = { total: 0, correct: 0, points: 0, count: 0 }
    }
    acc[date].total += attempt.total_questions
    acc[date].correct += attempt.correct_answers
    acc[date].points += attempt.points_earned
    acc[date].count += 1
    return acc
  }, {} as Record<string, { total: number; correct: number; points: number; count: number }>)

  const chartData = Object.entries(dataByDate)
    .map(([date, data]) => ({
      date,
      accuracy: Math.round((data.correct / data.total) * 100),
      points: data.points,
      quizzes: data.count,
    }))
    .reverse()
    .slice(-7)

  if (chartData.length === 0) {
    return (
      <div className="card-surface p-6">
        <h2 className="text-lg font-semibold mb-4">Progress Over Time</h2>
        <div className="h-64 flex items-center justify-center text-ink-soft">
          <p>Complete quizzes to see your progress chart</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card-surface p-6">
      <h2 className="text-lg font-semibold mb-4">Progress Over Time</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis 
              dataKey="date" 
              stroke="#a3a3a3" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#a3a3a3" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#171717', 
                border: '1px solid #2f2f2f',
                borderRadius: '12px',
                padding: '12px',
              }}
              labelStyle={{ color: '#f5f5f5', marginBottom: '4px' }}
              itemStyle={{ color: '#a3a3a3' }}
              formatter={(value: number) => [`${value}%`, 'Accuracy']}
            />
            <Line 
              type="monotone" 
              dataKey="accuracy" 
              stroke="#f2f2f2" 
              strokeWidth={2}
              dot={{ fill: '#f2f2f2', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: '#f2f2f2' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
