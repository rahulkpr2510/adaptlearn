import { createClient } from "@/lib/supabase/server"

interface TopicMasteryGridProps {
  userId: string
}

const TOPICS_BY_TRACK = {
  dsa: [
    { id: 'arrays', name: 'Arrays & Strings' },
    { id: 'linked-lists', name: 'Linked Lists' },
    { id: 'trees', name: 'Trees & Graphs' },
    { id: 'sorting', name: 'Sorting & Searching' },
    { id: 'dynamic-programming', name: 'Dynamic Programming' },
    { id: 'recursion', name: 'Recursion' },
  ],
  sql: [
    { id: 'select', name: 'SELECT Queries' },
    { id: 'joins', name: 'JOINs' },
    { id: 'aggregation', name: 'Aggregation' },
    { id: 'subqueries', name: 'Subqueries' },
    { id: 'indexing', name: 'Indexing' },
    { id: 'transactions', name: 'Transactions' },
  ],
  javascript: [
    { id: 'fundamentals', name: 'Fundamentals' },
    { id: 'async', name: 'Async/Await' },
    { id: 'closures', name: 'Closures' },
    { id: 'prototypes', name: 'Prototypes' },
    { id: 'dom', name: 'DOM Manipulation' },
    { id: 'es6', name: 'ES6+ Features' },
  ],
}

const TRACK_COLORS = {
  dsa: 'from-blue-500/20 to-blue-500/5',
  sql: 'from-green-500/20 to-green-500/5',
  javascript: 'from-yellow-500/20 to-yellow-500/5',
}

export async function TopicMasteryGrid({ userId }: TopicMasteryGridProps) {
  const supabase = await createClient()
  
  const { data: masteryData } = await supabase
    .from('topic_mastery')
    .select('*')
    .eq('user_id', userId)

  const masteryMap = (masteryData || []).reduce((acc, item) => {
    acc[`${item.track}-${item.topic}`] = item.mastery_level
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="card-surface p-6">
      <h2 className="text-lg font-semibold mb-4">Topic Mastery</h2>
      
      <div className="space-y-6">
        {(Object.entries(TOPICS_BY_TRACK) as [keyof typeof TOPICS_BY_TRACK, typeof TOPICS_BY_TRACK.dsa][]).map(([track, topics]) => (
          <div key={track}>
            <h3 className="text-sm font-medium uppercase tracking-wider text-ink-soft mb-3">
              {track === 'dsa' ? 'Data Structures & Algorithms' : track === 'sql' ? 'SQL' : 'JavaScript'}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {topics.map((topic) => {
                const mastery = masteryMap[`${track}-${topic.id}`] || 0
                return (
                  <div 
                    key={topic.id}
                    className={`p-3 rounded-xl bg-gradient-to-br ${TRACK_COLORS[track]} border border-line/50`}
                  >
                    <p className="text-sm font-medium truncate">{topic.name}</p>
                    <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-white/80 rounded-full transition-all"
                        style={{ width: `${mastery}%` }}
                      />
                    </div>
                    <p className="text-xs text-ink-soft mt-1">{mastery}% mastered</p>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
