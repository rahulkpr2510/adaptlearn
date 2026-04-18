import { DEMO_QUESTION_IDS } from "@/data/demo";
import questionBank from "@/data/question-bank.json";
import { getTrackById } from "@/data/tracks";
import { generateJsonFromAI } from "@/lib/ai";
import { sanitizeTopicArray } from "@/lib/topic-guard";
import type {
  Difficulty,
  QuizMode,
  QuizPayload,
  QuizQuestion,
} from "@/types/learning";

interface GenerateQuizInput {
  trackId: string;
  questionCount: number;
  topics?: string[];
  focusTopics?: string[];
  mode?: QuizMode;
}

interface AIRawQuestion {
  question?: unknown;
  options?: unknown;
  correctAnswer?: unknown;
  explanation?: unknown;
  difficulty?: unknown;
  tags?: unknown;
}

interface AIQuizResponse {
  questions?: AIRawQuestion[];
}

interface FallbackQuestionTemplate {
  difficulty: Difficulty;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];
const DEFAULT_AI_MAX_ATTEMPTS = 1;
const MAX_AI_BATCH_SIZE = 10;
const AI_OVER_GENERATION = 0;
const ADAPTIVE_POOL_EXTRA = 0;
const MAX_ADAPTIVE_POOL_SIZE = 10;
const DEFAULT_QUIZ_AI_TIMEOUT_MS = 4500;
const FALLBACK_DIFFICULTY_PATTERN: Difficulty[] = [
  "easy",
  "medium",
  "hard",
  "medium",
  "easy",
  "hard",
  "medium",
  "easy",
  "hard",
  "medium",
];

const QUESTION_BANK: QuizQuestion[] = questionBank
  .map((question, index) => {
    if (!Array.isArray(question.options) || question.options.length < 4) {
      return null;
    }

    if (typeof question.question !== "string") {
      return null;
    }

    const options = question.options
      .filter((option): option is string => typeof option === "string")
      .slice(0, 4);

    if (options.length !== 4) {
      return null;
    }

    const correctAnswer =
      typeof question.correctAnswer === "number" ? question.correctAnswer : 0;

    if (correctAnswer < 0 || correctAnswer > 3) {
      return null;
    }

    const tags = Array.isArray(question.tags)
      ? question.tags.filter((tag): tag is string => typeof tag === "string")
      : [];

    return {
      id:
        typeof question.id === "string" && question.id.length > 0
          ? question.id
          : `qb-${index + 1}`,
      question: question.question,
      options,
      correctAnswer,
      explanation:
        typeof question.explanation === "string"
          ? question.explanation
          : "Compare all options and review the core concept.",
      difficulty: normalizeDifficulty(question.difficulty),
      tags,
    } satisfies QuizQuestion;
  })
  .filter((question): question is QuizQuestion => Boolean(question));

function clampQuestionCount(count: number): number {
  return Math.min(10, Math.max(5, count));
}

function normalizeDifficulty(value: unknown): Difficulty {
  if (typeof value !== "string") {
    return "medium";
  }
  const normalized = value.toLowerCase();
  return DIFFICULTIES.includes(normalized as Difficulty)
    ? (normalized as Difficulty)
    : "medium";
}

function normalizeQuestion(
  raw: AIRawQuestion,
  index: number,
  allowedTopics: string[],
): QuizQuestion | null {
  if (!raw || typeof raw.question !== "string") {
    return null;
  }

  if (!Array.isArray(raw.options) || raw.options.length < 4) {
    return null;
  }

  const options = raw.options
    .filter((option): option is string => typeof option === "string")
    .slice(0, 4)
    .map((option) => option.trim())
    .filter(Boolean);

  if (options.length !== 4) {
    return null;
  }

  const correctAnswer =
    typeof raw.correctAnswer === "number" ? raw.correctAnswer : null;

  if (correctAnswer === null || correctAnswer < 0 || correctAnswer > 3) {
    return null;
  }

  const tags = Array.isArray(raw.tags)
    ? raw.tags.filter((tag): tag is string => typeof tag === "string")
    : [];

  const sanitizedTags = tags.filter((tag) => allowedTopics.includes(tag));
  const fallbackTag = allowedTopics[index % allowedTopics.length];

  return {
    id: `q-${Date.now()}-${index + 1}`,
    question: raw.question.trim(),
    options,
    correctAnswer,
    explanation:
      typeof raw.explanation === "string" && raw.explanation.trim().length > 0
        ? raw.explanation.trim()
        : "Review this concept and compare your approach with the option logic.",
    difficulty: normalizeDifficulty(raw.difficulty),
    tags: sanitizedTags.length > 0 ? sanitizedTags : [fallbackTag],
  };
}

function normalizeQuestionText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function pushUniqueQuestions(
  source: QuizQuestion[],
  incoming: QuizQuestion[],
  maxCount: number,
): QuizQuestion[] {
  const existing = new Set(
    source.map((question) => normalizeQuestionText(question.question)),
  );
  const merged = [...source];

  for (const question of incoming) {
    if (merged.length >= maxCount) {
      break;
    }

    const key = normalizeQuestionText(question.question);
    if (existing.has(key)) {
      continue;
    }

    existing.add(key);
    merged.push(question);
  }

  return merged;
}

function getAiMaxAttempts(): number {
  const parsed = Number.parseInt(process.env.QUIZ_AI_MAX_ATTEMPTS ?? "", 10);
  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.min(parsed, 2);
  }
  return DEFAULT_AI_MAX_ATTEMPTS;
}

function getQuizAiTimeoutMs(): number {
  const parsed = Number.parseInt(
    process.env.QUIZ_AI_REQUEST_TIMEOUT_MS ?? "",
    10,
  );
  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.min(parsed, 15000);
  }
  return DEFAULT_QUIZ_AI_TIMEOUT_MS;
}

function buildQuizPrompt(
  topics: string[],
  questionCount: number,
  existingQuestions: string[],
): string {
  const duplicateGuard =
    existingQuestions.length === 0
      ? ""
      : `\nAvoid these already-generated question stems:\n${existingQuestions
          .slice(0, 20)
          .map((question, index) => `${index + 1}. ${question}`)
          .join("\n")}\n`;

  return `Generate ${questionCount} unique coding multiple choice questions for the topics: ${topics.join(
    ", ",
  )}.

Constraints:
- Every question must have exactly 4 options.
- Use correctAnswer as zero-based index (0-3).
- Keep one correct answer only.
- Add a concise explanation.
- difficulty must be one of: easy, medium, hard.
- Keep a balanced spread across easy, medium, hard. For 10 questions target 3 easy, 4 medium, 3 hard.
- tags must include one or more topic names from this allowed list: ${topics.join(
    ", ",
  )}.
${duplicateGuard}
Return JSON object only:
{
  "questions": [
    {
      "question": "...",
      "options": ["...", "...", "...", "..."],
      "correctAnswer": 0,
      "explanation": "...",
      "difficulty": "easy",
      "tags": ["Arrays"]
    }
  ]
}`;
}

async function generateQuestionsBatchWithAI(
  topics: string[],
  requestedCount: number,
  existingQuestions: string[],
): Promise<QuizQuestion[]> {
  const systemPrompt =
    "You create precise multiple choice coding quiz questions for interview preparation. Return strict JSON only.";

  let aiPayload: AIQuizResponse | null = null;
  try {
    aiPayload = await generateJsonFromAI<AIQuizResponse>(
      systemPrompt,
      buildQuizPrompt(topics, requestedCount, existingQuestions),
      {
        timeoutMs: getQuizAiTimeoutMs(),
        maxRetries: 0,
      },
    );
  } catch {
    return [];
  }

  if (!aiPayload?.questions || !Array.isArray(aiPayload.questions)) {
    return [];
  }

  return aiPayload.questions
    .map((question, index) => normalizeQuestion(question, index, topics))
    .filter((question): question is QuizQuestion => Boolean(question));
}

function buildFallbackQuestion(
  topic: string,
  difficulty: Difficulty,
  topicIteration: number,
  index: number,
): QuizQuestion {
  const safeTopic = topic.trim();
  const normalizedTopic = safeTopic.toLowerCase();
  const isReactHooksTopic =
    normalizedTopic.includes("react hook") ||
    normalizedTopic.includes("hook") ||
    normalizedTopic.includes("usestate") ||
    normalizedTopic.includes("use state") ||
    normalizedTopic.includes("useeffect") ||
    normalizedTopic.includes("use effect") ||
    normalizedTopic.includes("usememo") ||
    normalizedTopic.includes("use memo") ||
    normalizedTopic.includes("usecallback") ||
    normalizedTopic.includes("use callback") ||
    normalizedTopic.includes("useref") ||
    normalizedTopic.includes("use ref") ||
    normalizedTopic.includes("custom hook") ||
    (normalizedTopic.includes("react") && normalizedTopic.includes("state"));
  const dpSubject =
    normalizedTopic.includes("dynamic programming") || normalizedTopic === "dp"
      ? "this problem"
      : safeTopic;

  const dynamicProgrammingTemplates: FallbackQuestionTemplate[] = [
    {
      difficulty: "easy",
      question: `Which property makes ${dpSubject} a strong fit for dynamic programming?`,
      options: [
        "Overlapping subproblems and optimal substructure",
        "Only sorted input and no repeated states",
        "Guaranteed constant memory regardless of input size",
        "Availability of a greedy choice at every step",
      ],
      correctAnswer: 0,
      explanation:
        "Dynamic programming is most useful when the same subproblems repeat and local optimal solutions compose into a global optimum.",
    },
    {
      difficulty: "easy",
      question:
        "What is the key difference between plain recursion and memoized recursion in dynamic programming?",
      options: [
        "Memoization caches subproblem results to avoid recomputation",
        "Memoization removes the need for base cases",
        "Memoization always gives O(1) runtime",
        "Memoization works only for graph problems",
      ],
      correctAnswer: 0,
      explanation:
        "Memoization stores previously computed states so repeated recursion branches do not recompute the same work.",
    },
    {
      difficulty: "medium",
      question:
        "In 0/1 knapsack with 1D DP, why do we iterate capacity from high to low?",
      options: [
        "To avoid reusing the same item multiple times in one iteration",
        "To make the algorithm recursive",
        "To reduce space complexity to O(1)",
        "To force lexicographically smallest solution",
      ],
      correctAnswer: 0,
      explanation:
        "Descending iteration ensures each item contributes at most once per stage in 0/1 knapsack.",
    },
    {
      difficulty: "medium",
      question: "When defining a DP state, what should be captured first?",
      options: [
        "The minimal information required to uniquely represent subproblem progress",
        "All input values copied into every state",
        "Only the final answer index",
        "Randomized choices to avoid local minima",
      ],
      correctAnswer: 0,
      explanation:
        "A good state definition is complete enough to represent progress but compact enough to keep transitions manageable.",
    },
    {
      difficulty: "hard",
      question: "When can a 2D DP table be safely optimized to 1D?",
      options: [
        "When each state depends only on current row and one previous row in a controlled update order",
        "Whenever the table has more than 100 rows",
        "Only when all transitions are constant time",
        "Only for shortest path problems",
      ],
      correctAnswer: 0,
      explanation:
        "Space optimization is valid only if overwritten values are no longer needed by future transitions.",
    },
    {
      difficulty: "hard",
      question:
        "For DP on a DAG, which processing order is typically required?",
      options: [
        "Topological order so dependencies are computed before dependents",
        "Any random node order",
        "Strictly reverse alphabetical node order",
        "Depth-limited BFS only",
      ],
      correctAnswer: 0,
      explanation:
        "DAG transitions require prerequisites to be ready first, which topological ordering guarantees.",
    },
  ];

  const sqlTemplates: FallbackQuestionTemplate[] = [
    {
      difficulty: "easy",
      question: "Which clause filters rows before grouping in SQL?",
      options: ["WHERE", "HAVING", "ORDER BY", "LIMIT"],
      correctAnswer: 0,
      explanation:
        "WHERE runs before GROUP BY and filters raw rows; HAVING filters grouped results.",
    },
    {
      difficulty: "easy",
      question: "How should SQL check for missing values?",
      options: ["IS NULL", "= NULL", "== NULL", "NULL()"],
      correctAnswer: 0,
      explanation:
        "NULL comparisons use IS NULL and IS NOT NULL, not equality operators.",
    },
    {
      difficulty: "medium",
      question:
        "What does a LEFT JOIN return when there is no match on the right table?",
      options: [
        "The left row with NULLs for right-table columns",
        "Only fully matched rows",
        "No rows at all",
        "An error unless COALESCE is used",
      ],
      correctAnswer: 0,
      explanation:
        "LEFT JOIN preserves all rows from the left table and fills missing right-side data with NULL.",
    },
    {
      difficulty: "medium",
      question:
        "In a grouped SQL query, which columns may appear in SELECT without aggregation?",
      options: [
        "Only columns listed in GROUP BY",
        "Any columns from joined tables",
        "Only numeric columns",
        "No columns can be selected directly",
      ],
      correctAnswer: 0,
      explanation:
        "Non-aggregated projected columns must be functionally grouped, usually by appearing in GROUP BY.",
    },
    {
      difficulty: "medium",
      question:
        "Which SQL pattern correctly computes total orders per customer?",
      options: [
        "SELECT customer_id, COUNT(*) FROM orders GROUP BY customer_id",
        "SELECT customer_id, COUNT(*) FROM orders",
        "SELECT DISTINCT customer_id, COUNT(*) FROM orders",
        "SELECT customer_id FROM orders HAVING COUNT(*)",
      ],
      correctAnswer: 0,
      explanation:
        "Aggregate queries must group by the non-aggregated key to compute per-customer totals.",
    },
    {
      difficulty: "hard",
      question:
        "Which window expression ranks rows within each department by salary?",
      options: [
        "ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC)",
        "ROW_NUMBER() OVER (ORDER BY department)",
        "GROUP BY department, salary",
        "COUNT(*) OVER ()",
      ],
      correctAnswer: 0,
      explanation:
        "Partitioning by department and ordering by salary computes per-department ranking.",
    },
    {
      difficulty: "hard",
      question: "Why can `LIKE '%term'` hurt index usage in SQL?",
      options: [
        "A leading wildcard prevents efficient prefix index scans",
        "LIKE cannot be used with text columns",
        "Indexes work only for exact integer matches",
        "The query planner disables all indexes for LIKE",
      ],
      correctAnswer: 0,
      explanation:
        "B-tree indexes optimize prefix lookups; leading wildcards often force broader scans.",
    },
  ];

  const reactHooksTemplates: FallbackQuestionTemplate[] = [
    {
      difficulty: "easy",
      question:
        "Which React hook is used to add local state in a function component?",
      options: ["useState", "useEffect", "useMemo", "useRef"],
      correctAnswer: 0,
      explanation:
        "useState creates component-local state and a setter for updates.",
    },
    {
      difficulty: "easy",
      question: "What does `useRef` primarily provide in React components?",
      options: [
        "A mutable value that persists across renders without causing rerenders",
        "A way to memoize expensive calculations",
        "A lifecycle replacement for class components",
        "A hook that batches state updates automatically",
      ],
      correctAnswer: 0,
      explanation:
        "useRef stores mutable values or DOM refs that survive rerenders and do not trigger render on change.",
    },
    {
      difficulty: "medium",
      question: "When does an effect with dependency array `[]` run?",
      options: [
        "After initial render, and cleanup on unmount",
        "After every render",
        "Only when props change",
        "Only when state changes",
      ],
      correctAnswer: 0,
      explanation:
        "An empty dependency array runs once after mount and its cleanup during unmount.",
    },
    {
      difficulty: "medium",
      question:
        "Why should values used inside `useEffect` usually appear in its dependency array?",
      options: [
        "To avoid stale closures and keep effect logic synced with current values",
        "To force React to skip effect execution",
        "To convert effects into memoized values",
        "To make effects run only on unmount",
      ],
      correctAnswer: 0,
      explanation:
        "Missing dependencies can freeze older captured values, producing stale behavior and hard-to-debug bugs.",
    },
    {
      difficulty: "hard",
      question: "When is `useCallback` most useful?",
      options: [
        "When passing callbacks to memoized children to keep function identity stable",
        "When replacing all state with refs",
        "When effects need to run on every render",
        "When avoiding all dependency arrays",
      ],
      correctAnswer: 0,
      explanation:
        "useCallback helps avoid unnecessary child rerenders when referential equality of callbacks matters.",
    },
    {
      difficulty: "hard",
      question:
        "What common bug can happen if a `useEffect` updates a state value that is also in its dependency list without a guard?",
      options: [
        "An infinite render-effect loop",
        "The effect never executes",
        "Hooks stop working after one render",
        "State becomes immutable",
      ],
      correctAnswer: 0,
      explanation:
        "Updating a tracked dependency on every effect run can retrigger the effect indefinitely unless conditions break the cycle.",
    },
  ];

  const genericCodingTemplates: FallbackQuestionTemplate[] = [
    {
      difficulty: "easy",
      question: `What is the first thing to verify before optimizing a ${safeTopic} solution?`,
      options: [
        "Correctness against constraints and edge cases",
        "Whether the code is shortest in lines",
        "Whether recursion is used",
        "Whether the answer is already sorted",
      ],
      correctAnswer: 0,
      explanation:
        "Optimization on top of incorrect logic compounds bugs, so correctness should be locked first.",
    },
    {
      difficulty: "easy",
      question: `For ${safeTopic}, what does O(n) time complexity imply?`,
      options: [
        "Runtime grows linearly with input size",
        "Runtime is constant regardless of input",
        "Runtime doubles every step",
        "Runtime is always faster than O(log n)",
      ],
      correctAnswer: 0,
      explanation:
        "O(n) means processing cost scales proportionally with the number of input elements.",
    },
    {
      difficulty: "medium",
      question: `When designing a ${safeTopic} algorithm, why define an invariant?`,
      options: [
        "It provides a condition that must stay true at each step and helps prove correctness",
        "It automatically optimizes space complexity",
        "It removes the need for testing",
        "It guarantees O(1) runtime",
      ],
      correctAnswer: 0,
      explanation:
        "Invariants are core to reasoning about algorithm correctness through every iteration.",
    },
    {
      difficulty: "medium",
      question: `For ${safeTopic}, when is a hash-based structure typically preferred?`,
      options: [
        "When average-case O(1) membership or lookup is needed",
        "When sorted traversal is mandatory",
        "When memory must be strictly O(1)",
        "When duplicates are always forbidden by input",
      ],
      correctAnswer: 0,
      explanation:
        "Hash maps/sets trade ordering for fast average-case lookup and membership tests.",
    },
    {
      difficulty: "hard",
      question: `Which trade-off is most common while optimizing ${safeTopic} solutions?`,
      options: [
        "Reducing runtime by using additional memory",
        "Reducing runtime by removing all condition checks",
        "Reducing memory by duplicating arrays",
        "Reducing runtime by avoiding any data structures",
      ],
      correctAnswer: 0,
      explanation:
        "Many high-performance solutions spend extra memory to avoid repeated computation.",
    },
    {
      difficulty: "hard",
      question: `What is the most reliable way to validate a complex ${safeTopic} implementation?`,
      options: [
        "Test edge cases, adversarial inputs, and verify complexity assumptions",
        "Run one happy-path test only",
        "Rely on compiler warnings alone",
        "Skip tests when code compiles",
      ],
      correctAnswer: 0,
      explanation:
        "Complex implementations require both correctness stress tests and complexity sanity checks.",
    },
  ];

  const templateSet =
    normalizedTopic.includes("dynamic programming") || normalizedTopic === "dp"
      ? dynamicProgrammingTemplates
      : isReactHooksTopic
        ? reactHooksTemplates
        : normalizedTopic.includes("sql") ||
            normalizedTopic.includes("database") ||
            normalizedTopic.includes("postgres") ||
            normalizedTopic.includes("mysql")
          ? sqlTemplates
          : genericCodingTemplates;

  const difficultyPool = templateSet.filter(
    (template) => template.difficulty === difficulty,
  );
  const pool = difficultyPool.length > 0 ? difficultyPool : templateSet;
  const template = pool[topicIteration % pool.length] ?? pool[0];
  const cycle = Math.floor(topicIteration / pool.length);
  const cycleLabel = cycle === 0 ? "" : ` (Version ${cycle + 1})`;

  return {
    id: `fb-${Date.now()}-${index + 1}`,
    question: `${template.question}${cycleLabel}`,
    options: template.options,
    correctAnswer: template.correctAnswer,
    explanation: template.explanation,
    difficulty: template.difficulty,
    tags: [safeTopic],
  };
}

function generateFallbackQuestions(
  topics: string[],
  questionCount: number,
): QuizQuestion[] {
  const questionBankCandidates: QuizQuestion[] = [];
  const usedQuestionTexts = new Set<string>();

  const topicBuckets = topics.map((topic) => ({
    topic,
    matches: QUESTION_BANK.filter((question) =>
      question.tags.some((tag) => {
        const normalizedTopic = topic.toLowerCase().trim();
        const normalizedTag = tag.toLowerCase().trim();
        return (
          normalizedTopic === normalizedTag ||
          normalizedTopic.includes(normalizedTag) ||
          normalizedTag.includes(normalizedTopic)
        );
      }),
    ),
  }));

  for (
    let round = 0;
    questionBankCandidates.length < questionCount;
    round += 1
  ) {
    let hasAnyCandidateInRound = false;

    for (const bucket of topicBuckets) {
      const candidate = bucket.matches[round];
      if (!candidate) {
        continue;
      }

      hasAnyCandidateInRound = true;
      const candidateKey = normalizeQuestionText(candidate.question);
      if (usedQuestionTexts.has(candidateKey)) {
        continue;
      }

      usedQuestionTexts.add(candidateKey);
      questionBankCandidates.push({
        ...candidate,
        id: `fb-bank-${Date.now()}-${questionBankCandidates.length + 1}`,
        tags: [bucket.topic],
      });

      if (questionBankCandidates.length >= questionCount) {
        break;
      }
    }

    if (!hasAnyCandidateInRound) {
      break;
    }
  }

  if (questionBankCandidates.length >= questionCount) {
    return questionBankCandidates.slice(0, questionCount);
  }

  const templateQuestions: QuizQuestion[] = [];
  const topicCounters = new Map<string, number>();

  for (let index = 0; index < questionCount; index += 1) {
    const topic = topics[index % topics.length];
    const difficulty =
      FALLBACK_DIFFICULTY_PATTERN[index % FALLBACK_DIFFICULTY_PATTERN.length] ??
      "medium";
    const counterKey = `${topic.toLowerCase()}|${difficulty}`;
    const topicIteration = topicCounters.get(counterKey) ?? 0;
    topicCounters.set(counterKey, topicIteration + 1);

    templateQuestions.push(
      buildFallbackQuestion(topic, difficulty, topicIteration, index),
    );
  }

  return pushUniqueQuestions(
    questionBankCandidates,
    templateQuestions,
    questionCount,
  );
}

async function generateQuestionsWithAI(
  topics: string[],
  questionCount: number,
): Promise<QuizQuestion[]> {
  const maxAttempts = getAiMaxAttempts();
  let collected: QuizQuestion[] = [];

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (collected.length >= questionCount) {
      break;
    }

    const remaining = questionCount - collected.length;
    const requestedCount = Math.min(
      MAX_AI_BATCH_SIZE,
      remaining + AI_OVER_GENERATION,
    );

    const batch = await generateQuestionsBatchWithAI(
      topics,
      requestedCount,
      collected.map((question) => question.question),
    );

    collected = pushUniqueQuestions(collected, batch, questionCount);

    if (batch.length === 0) {
      break;
    }
  }

  return collected.slice(0, questionCount);
}

function pickDemoQuestions(questionCount: number): QuizQuestion[] {
  const seededQuestions = QUESTION_BANK.filter((question) =>
    DEMO_QUESTION_IDS.includes(question.id),
  );

  return seededQuestions.slice(0, questionCount).map((question, index) => ({
    ...question,
    id: `demo-${index + 1}`,
  }));
}

export class QuizGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuizGenerationError";
  }
}

export async function generateQuiz(
  input: GenerateQuizInput,
): Promise<QuizPayload> {
  const track = getTrackById(input.trackId);
  const targetQuestionCount = clampQuestionCount(input.questionCount);

  const baseTopics = Array.isArray(input.topics)
    ? sanitizeTopicArray(input.topics)
    : [];

  const focusTopics = Array.isArray(input.focusTopics)
    ? sanitizeTopicArray(input.focusTopics)
    : [];

  const selectedTopicsRaw =
    focusTopics.length > 0
      ? Array.from(new Set([...focusTopics, ...baseTopics]))
      : baseTopics;

  const selectedTopics =
    input.mode === "demo" && selectedTopicsRaw.length === 0
      ? track.topics
      : selectedTopicsRaw;

  if (selectedTopics.length === 0) {
    throw new QuizGenerationError(
      "Please select at least one topic before starting the quiz.",
    );
  }

  if (input.mode === "demo") {
    return {
      id: `quiz-demo-${Date.now()}`,
      trackId: track.id,
      domain: track.domain,
      topics: selectedTopics,
      questions: pickDemoQuestions(targetQuestionCount),
      generatedBy: "demo",
      generatedAt: new Date().toISOString(),
      targetQuestionCount,
      adaptive: false,
    };
  }

  const adaptivePoolSize = Math.min(
    MAX_ADAPTIVE_POOL_SIZE,
    targetQuestionCount + ADAPTIVE_POOL_EXTRA,
  );

  const aiQuestions = await generateQuestionsWithAI(
    selectedTopics,
    adaptivePoolSize,
  );

  const mergedQuestions =
    aiQuestions.length >= adaptivePoolSize
      ? aiQuestions
      : pushUniqueQuestions(
          aiQuestions,
          generateFallbackQuestions(selectedTopics, adaptivePoolSize),
          adaptivePoolSize,
        );

  if (mergedQuestions.length < targetQuestionCount) {
    throw new QuizGenerationError(
      "Could not generate enough questions for selected coding topics right now. Please retry.",
    );
  }

  const generatedBy =
    aiQuestions.length === 0
      ? "fallback"
      : aiQuestions.length < mergedQuestions.length
        ? "hybrid"
        : "ai";

  return {
    id: `quiz-ai-${Date.now()}`,
    trackId: track.id,
    domain: track.domain,
    topics: selectedTopics,
    questions: mergedQuestions,
    generatedBy,
    generatedAt: new Date().toISOString(),
    targetQuestionCount,
    adaptive: true,
  };
}
