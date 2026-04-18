import { CONCEPT_BY_ID, getConceptsForTrack } from "@/data/adaptive-concepts";
import { getQuestionsForTrack } from "@/data/adaptive-questions";
import { getTrack } from "@/data/adaptive-tracks";
import type {
  AnswerMap,
  AttemptRecord,
  Concept,
  ConceptPerformance,
  ConceptStatus,
  DiagnosisResult,
  PersonalizedRoadmap,
  Question,
  QuizMode,
  QuizSession,
  RoadmapStep,
  TrackKey,
} from "@/types/adaptive";

interface QuizGenerationOptions {
  trackKey: TrackKey;
  attemptNumber: number;
  excludeQuestionIds?: string[];
  questionCount?: number;
}

interface DiagnoseOptions {
  trackKey: TrackKey;
  mode: QuizMode;
  quiz: QuizSession;
  answers: AnswerMap;
  history: AttemptRecord[];
}

const DIFFICULTY_ORDER: Array<Question["difficulty"]> = [
  "easy",
  "medium",
  "hard",
];

const STATUS_WEIGHT: Record<ConceptStatus, number> = {
  Strong: 1,
  Improving: 2,
  Weak: 3,
};

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function createSeededRng(seed: number): () => number {
  let state = seed || 1;
  return function next() {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function shuffleDeterministic<T>(items: T[], seed: string): T[] {
  const shuffled = [...items];
  const random = createSeededRng(hashString(seed));

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

function roundPercentage(value: number): number {
  return Math.round(value * 100) / 100;
}

function getConceptLabel(conceptId: string): string {
  return CONCEPT_BY_ID.get(conceptId)?.name ?? conceptId;
}

function getConceptOrder(trackKey: TrackKey): Concept[] {
  const concepts = getConceptsForTrack(trackKey);
  const map = new Map(concepts.map((concept) => [concept.id, concept]));
  const visited = new Set<string>();
  const ordered: Concept[] = [];

  function visit(conceptId: string): void {
    if (visited.has(conceptId)) {
      return;
    }

    visited.add(conceptId);
    const concept = map.get(conceptId);
    if (!concept) {
      return;
    }

    concept.prerequisites.forEach((prereqId) => {
      if (map.has(prereqId)) {
        visit(prereqId);
      }
    });

    ordered.push(concept);
  }

  concepts.forEach((concept) => visit(concept.id));
  return ordered;
}

function difficultyDistance(
  questionDifficulty: Question["difficulty"],
  targetDifficulty: Question["difficulty"],
): number {
  const questionIndex = DIFFICULTY_ORDER.indexOf(questionDifficulty);
  const targetIndex = DIFFICULTY_ORDER.indexOf(targetDifficulty);
  return Math.abs(questionIndex - targetIndex);
}

function pickQuestion(
  candidates: Question[],
  seed: string,
  targetDifficulty?: Question["difficulty"],
): Question | null {
  if (candidates.length === 0) {
    return null;
  }

  const shuffled = shuffleDeterministic(candidates, seed);

  if (!targetDifficulty) {
    return shuffled[0] ?? null;
  }

  const sorted = [...shuffled].sort((left, right) => {
    const leftDistance = difficultyDistance(left.difficulty, targetDifficulty);
    const rightDistance = difficultyDistance(
      right.difficulty,
      targetDifficulty,
    );

    if (leftDistance !== rightDistance) {
      return leftDistance - rightDistance;
    }

    return 0;
  });

  return sorted[0] ?? null;
}

function buildDifficultyTargets(
  questionCount: number,
): Record<Question["difficulty"], number> {
  const easy = Math.max(2, Math.round(questionCount * 0.3));
  const hard = Math.max(2, Math.round(questionCount * 0.25));
  const medium = Math.max(2, questionCount - easy - hard);

  return {
    easy,
    medium,
    hard,
  };
}

function rankConceptRecurrence(history: AttemptRecord[]): Map<string, number> {
  const recurrence = new Map<string, number>();

  history.forEach((attempt) => {
    attempt.diagnosis.weakConcepts.forEach((conceptName) => {
      const concept = getConceptsForTrack(attempt.trackKey).find(
        (entry) => entry.name === conceptName,
      );
      if (!concept) {
        return;
      }
      recurrence.set(concept.id, (recurrence.get(concept.id) ?? 0) + 1);
    });
  });

  return recurrence;
}

function averageHistoricalAccuracy(
  conceptId: string,
  history: AttemptRecord[],
): number | null {
  const values = history
    .map((attempt) =>
      attempt.diagnosis.conceptPerformance.find(
        (entry) => entry.conceptId === conceptId,
      ),
    )
    .filter((entry): entry is ConceptPerformance => Boolean(entry))
    .map((entry) => entry.accuracy);

  if (values.length === 0) {
    return null;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  return roundPercentage(total / values.length);
}

function classifyStatus(accuracy: number): ConceptStatus {
  if (accuracy >= 80) {
    return "Strong";
  }

  if (accuracy >= 55) {
    return "Improving";
  }

  return "Weak";
}

function addPrerequisiteRepairs(
  conceptId: string,
  performanceById: Map<string, ConceptPerformance>,
  orderedIds: string[],
  repairingIds: Set<string>,
): void {
  const concept = CONCEPT_BY_ID.get(conceptId);
  if (!concept) {
    return;
  }

  concept.prerequisites.forEach((prereqId) => {
    const prereqPerformance = performanceById.get(prereqId);
    if (!prereqPerformance) {
      return;
    }

    if (prereqPerformance.status === "Strong") {
      return;
    }

    if (!orderedIds.includes(prereqId)) {
      orderedIds.push(prereqId);
      repairingIds.add(prereqId);
    }
  });
}

function buildConfidenceSummary(
  score: number,
  weakCount: number,
  trendDelta: number,
): string {
  const trendMessage =
    trendDelta > 0
      ? `You improved by ${Math.round(trendDelta)} points from your previous attempt.`
      : trendDelta < 0
        ? `Your score dropped by ${Math.abs(Math.round(trendDelta))} points from the previous attempt.`
        : "Your score is stable compared to the previous attempt.";

  if (score >= 85 && weakCount === 0) {
    return `High confidence. Core concepts are stable and execution quality is consistent. ${trendMessage}`;
  }

  if (score >= 70) {
    return `Moderate-to-high confidence. You are close to interview-ready performance with a few targeted repairs remaining. ${trendMessage}`;
  }

  if (score >= 50) {
    return `Developing confidence. Foundational understanding exists, but consistency breaks on medium complexity prompts. ${trendMessage}`;
  }

  return `Low confidence right now. Focus on prerequisite repair before increasing difficulty. ${trendMessage}`;
}

function buildRoadmap(
  trackKey: TrackKey,
  performance: ConceptPerformance[],
  history: AttemptRecord[],
  trendDelta: number,
): PersonalizedRoadmap {
  const track = getTrack(trackKey);
  const performanceById = new Map(
    performance.map((entry) => [entry.conceptId, entry]),
  );
  const recurrence = rankConceptRecurrence(history);

  const weakIds = performance
    .filter((entry) => entry.status === "Weak")
    .sort((left, right) => {
      if (left.accuracy !== right.accuracy) {
        return left.accuracy - right.accuracy;
      }
      return (
        (recurrence.get(right.conceptId) ?? 0) -
        (recurrence.get(left.conceptId) ?? 0)
      );
    })
    .map((entry) => entry.conceptId);

  const improvingIds = performance
    .filter((entry) => entry.status === "Improving")
    .sort((left, right) => {
      if (left.prerequisiteGap !== right.prerequisiteGap) {
        return Number(right.prerequisiteGap) - Number(left.prerequisiteGap);
      }
      return left.accuracy - right.accuracy;
    })
    .map((entry) => entry.conceptId);

  const priorityIds: string[] = [];
  const repairingIds = new Set<string>();

  weakIds.forEach((conceptId) => {
    addPrerequisiteRepairs(
      conceptId,
      performanceById,
      priorityIds,
      repairingIds,
    );
    if (!priorityIds.includes(conceptId)) {
      priorityIds.push(conceptId);
    }
  });

  improvingIds.forEach((conceptId) => {
    if (!priorityIds.includes(conceptId)) {
      priorityIds.push(conceptId);
    }
  });

  const selectedIds = priorityIds.slice(0, 3);

  const steps: RoadmapStep[] = selectedIds.map((conceptId) => {
    const concept = CONCEPT_BY_ID.get(conceptId);
    const conceptPerformance = performanceById.get(conceptId);

    if (!concept || !conceptPerformance) {
      return {
        conceptId,
        conceptName: getConceptLabel(conceptId),
        reason: "Limited data available for this concept.",
        whyNow: "This concept influences downstream question quality.",
        prerequisiteRepair: false,
        studyFocus: "Review fundamentals and attempt focused practice.",
        practicePlan: ["Solve 3 focused practice questions."],
        retestCriteria: "Retest after one focused study session.",
      };
    }

    const recurrenceCount = recurrence.get(conceptId) ?? 0;
    const dependentNames = getConceptsForTrack(trackKey)
      .filter((entry) => entry.prerequisites.includes(conceptId))
      .map((entry) => entry.name);

    const recurrenceMessage =
      recurrenceCount > 0
        ? ` It appeared as weak in ${recurrenceCount} previous attempt${recurrenceCount > 1 ? "s" : ""}.`
        : "";

    const whyNow = repairingIds.has(conceptId)
      ? `${concept.name} is a prerequisite gap. Repairing it reduces errors in dependent concepts${
          dependentNames.length > 0 ? ` like ${dependentNames.join(", ")}` : ""
        }.`
      : recurrenceCount > 1
        ? `${concept.name} is repeatedly unstable, so fixing it now prevents score plateaus.`
        : `${concept.name} has the highest impact on short-term score recovery.`;

    return {
      conceptId,
      conceptName: concept.name,
      reason: `${concept.name} is at ${Math.round(conceptPerformance.accuracy)}% accuracy (${conceptPerformance.correct}/${conceptPerformance.total}).${recurrenceMessage}`,
      whyNow,
      prerequisiteRepair: repairingIds.has(conceptId),
      studyFocus: `${concept.revisionNotes} Priority objective: ${concept.learningObjectives[0]}`,
      practicePlan: concept.practiceTasks.slice(0, 3),
      retestCriteria: concept.retestGoal,
    };
  });

  const followUpQuizConcepts = Array.from(
    new Set([
      ...steps.map((step) => step.conceptId),
      ...weakIds,
      ...steps.flatMap(
        (step) => CONCEPT_BY_ID.get(step.conceptId)?.prerequisites ?? [],
      ),
    ]),
  ).slice(0, 5);

  const trendClause =
    trendDelta > 0
      ? `Your trend is positive (+${Math.round(trendDelta)}), so keep momentum with medium-first practice.`
      : trendDelta < 0
        ? `Recent trend is negative (${Math.round(trendDelta)}), so prioritize fundamentals before harder prompts.`
        : "Trend is flat; add deliberate error-review between sessions.";

  const stepNames = steps.map((step) => step.conceptName).join(" -> ");

  return {
    summary: `For ${track.label}, focus sequence: ${stepNames || "core revision"}. ${trendClause}`,
    steps,
    followUpQuizConcepts,
    estimatedSessions: Math.max(2, steps.length * 2),
  };
}

function createQuizSession(
  trackKey: TrackKey,
  mode: QuizMode,
  questions: Question[],
): QuizSession {
  return {
    id: `${mode}-${trackKey}-${Date.now()}`,
    trackKey,
    mode,
    questions,
    startedAt: new Date().toISOString(),
  };
}

function selectBalancedQuestions(
  candidates: Question[],
  questionCount: number,
  seed: string,
  selectedIds: Set<string>,
): Question[] {
  const selected: Question[] = [];
  const targets = buildDifficultyTargets(questionCount);

  DIFFICULTY_ORDER.forEach((difficulty) => {
    const limit = targets[difficulty];
    const bucket = shuffleDeterministic(
      candidates.filter(
        (question) =>
          question.difficulty === difficulty && !selectedIds.has(question.id),
      ),
      `${seed}:${difficulty}`,
    );

    for (
      let index = 0;
      index < bucket.length && selected.length < questionCount;
      index += 1
    ) {
      if (
        selected.filter((entry) => entry.difficulty === difficulty).length >=
        limit
      ) {
        break;
      }

      const question = bucket[index];
      if (!question) {
        continue;
      }

      selected.push(question);
      selectedIds.add(question.id);
    }
  });

  const remaining = shuffleDeterministic(
    candidates.filter((question) => !selectedIds.has(question.id)),
    `${seed}:remaining`,
  );

  for (
    let index = 0;
    index < remaining.length && selected.length < questionCount;
    index += 1
  ) {
    const question = remaining[index];
    if (!question) {
      continue;
    }
    selected.push(question);
    selectedIds.add(question.id);
  }

  return selected;
}

export function buildDiagnosticQuiz(
  options: QuizGenerationOptions,
): QuizSession {
  const track = getTrack(options.trackKey);
  const questionCount = Math.max(8, Math.min(options.questionCount ?? 10, 10));
  const seed = `diagnostic:${track.key}:${options.attemptNumber}`;
  const concepts = getConceptOrder(track.key);
  const questionPool = getQuestionsForTrack(track.key);

  const selected: Question[] = [];
  const selectedIds = new Set<string>(options.excludeQuestionIds ?? []);

  concepts.forEach((concept, index) => {
    if (selected.length >= questionCount) {
      return;
    }

    const conceptCandidates = questionPool.filter(
      (question) =>
        question.conceptTags.includes(concept.id) &&
        !selectedIds.has(question.id),
    );

    const targetDifficulty: Question["difficulty"] =
      index < 2 ? "easy" : index < 4 ? "medium" : "hard";

    const picked = pickQuestion(
      conceptCandidates,
      `${seed}:${concept.id}:${index}`,
      targetDifficulty,
    );

    if (picked) {
      selected.push(picked);
      selectedIds.add(picked.id);
    }
  });

  const needed = questionCount - selected.length;
  if (needed > 0) {
    const fill = selectBalancedQuestions(
      questionPool,
      needed,
      `${seed}:fill`,
      selectedIds,
    );
    selected.push(...fill);
  }

  return createQuizSession(
    track.key,
    "diagnostic",
    selected.slice(0, questionCount),
  );
}

function rankFollowUpQuestions(
  questions: Question[],
  focusSet: Set<string>,
  weakSet: Set<string>,
): Question[] {
  return [...questions].sort((left, right) => {
    const leftFocus = left.conceptTags.some((tag) => focusSet.has(tag));
    const rightFocus = right.conceptTags.some((tag) => focusSet.has(tag));

    if (leftFocus !== rightFocus) {
      return Number(rightFocus) - Number(leftFocus);
    }

    const leftWeak = left.conceptTags.some((tag) => weakSet.has(tag));
    const rightWeak = right.conceptTags.some((tag) => weakSet.has(tag));

    if (leftWeak !== rightWeak) {
      return Number(rightWeak) - Number(leftWeak);
    }

    return (
      DIFFICULTY_ORDER.indexOf(left.difficulty) -
      DIFFICULTY_ORDER.indexOf(right.difficulty)
    );
  });
}

export function buildFollowUpQuiz(options: {
  trackKey: TrackKey;
  diagnosis: DiagnosisResult;
  attemptNumber: number;
  excludeQuestionIds?: string[];
  questionCount?: number;
}): QuizSession {
  const track = getTrack(options.trackKey);
  const questionCount = Math.max(5, Math.min(options.questionCount ?? 5, 5));
  const weakIds = new Set(
    options.diagnosis.conceptPerformance
      .filter((entry) => entry.status === "Weak")
      .map((entry) => entry.conceptId),
  );

  const focusIds = new Set(options.diagnosis.roadmap.followUpQuizConcepts);

  options.diagnosis.conceptPerformance.forEach((entry) => {
    if (entry.status === "Weak" || entry.prerequisiteGap) {
      focusIds.add(entry.conceptId);
      const concept = CONCEPT_BY_ID.get(entry.conceptId);
      concept?.prerequisites.forEach((prereq) => focusIds.add(prereq));
    }
  });

  const excludeIds = new Set(options.excludeQuestionIds ?? []);
  const pool = getQuestionsForTrack(track.key).filter(
    (question) => !excludeIds.has(question.id),
  );

  const ranked = rankFollowUpQuestions(pool, focusIds, weakIds);
  const selected: Question[] = [];
  const used = new Set<string>();

  for (
    let index = 0;
    index < ranked.length && selected.length < questionCount;
    index += 1
  ) {
    const question = ranked[index];
    if (!question || used.has(question.id)) {
      continue;
    }

    if (!question.conceptTags.some((tag) => focusIds.has(tag))) {
      continue;
    }

    selected.push(question);
    used.add(question.id);
  }

  if (selected.length < questionCount) {
    const fallback = shuffleDeterministic(
      ranked.filter((question) => !used.has(question.id)),
      `follow-up:${track.key}:${options.attemptNumber}`,
    );

    for (
      let index = 0;
      index < fallback.length && selected.length < questionCount;
      index += 1
    ) {
      const question = fallback[index];
      if (!question) {
        continue;
      }
      selected.push(question);
      used.add(question.id);
    }
  }

  return createQuizSession(track.key, "follow-up", selected);
}

export function diagnoseQuiz(options: DiagnoseOptions): DiagnosisResult {
  const track = getTrack(options.trackKey);
  const conceptOrder = getConceptOrder(track.key);

  const correctCount = options.quiz.questions.reduce((sum, question) => {
    const answer = options.answers[question.id];
    return sum + (answer === question.answerIndex ? 1 : 0);
  }, 0);

  const totalQuestions = options.quiz.questions.length;
  const score = roundPercentage(
    (correctCount / Math.max(1, totalQuestions)) * 100,
  );

  const conceptPerformance: ConceptPerformance[] = conceptOrder.map(
    (concept) => {
      const taggedQuestions = options.quiz.questions.filter((question) =>
        question.conceptTags.includes(concept.id),
      );

      const total = taggedQuestions.length;
      const correct = taggedQuestions.reduce((sum, question) => {
        return (
          sum + (options.answers[question.id] === question.answerIndex ? 1 : 0)
        );
      }, 0);

      const historicalAccuracy = averageHistoricalAccuracy(
        concept.id,
        options.history,
      );
      const accuracy =
        total > 0
          ? roundPercentage((correct / total) * 100)
          : (historicalAccuracy ?? 0);

      return {
        conceptId: concept.id,
        conceptName: concept.name,
        total,
        correct,
        accuracy,
        status: classifyStatus(accuracy),
        prerequisiteGap: false,
      };
    },
  );

  const performanceById = new Map(
    conceptPerformance.map((entry) => [entry.conceptId, entry]),
  );

  conceptPerformance.forEach((entry) => {
    const concept = CONCEPT_BY_ID.get(entry.conceptId);
    if (!concept) {
      return;
    }

    entry.prerequisiteGap = concept.prerequisites.some((prereq) => {
      const prereqPerformance = performanceById.get(prereq);
      return prereqPerformance ? prereqPerformance.accuracy < 65 : false;
    });
  });

  const sorted = [...conceptPerformance].sort((left, right) => {
    const statusDiff = STATUS_WEIGHT[right.status] - STATUS_WEIGHT[left.status];
    if (statusDiff !== 0) {
      return statusDiff;
    }
    return left.accuracy - right.accuracy;
  });

  const previousScore = options.history.at(-1)?.diagnosis.score ?? score;
  const trendDelta = roundPercentage(score - previousScore);

  const roadmap = buildRoadmap(
    track.key,
    conceptPerformance,
    options.history,
    trendDelta,
  );

  const strongConcepts = conceptPerformance
    .filter((entry) => entry.status === "Strong")
    .map((entry) => entry.conceptName);

  const improvingConcepts = conceptPerformance
    .filter((entry) => entry.status === "Improving")
    .map((entry) => entry.conceptName);

  const weakConcepts = conceptPerformance
    .filter((entry) => entry.status === "Weak")
    .map((entry) => entry.conceptName);

  const nextBestFocus =
    roadmap.steps[0]?.conceptName ??
    sorted[0]?.conceptName ??
    "General revision";

  return {
    id: `diagnosis-${options.trackKey}-${Date.now()}`,
    trackKey: options.trackKey,
    mode: options.mode,
    score,
    correctCount,
    totalQuestions,
    conceptPerformance,
    strongConcepts,
    improvingConcepts,
    weakConcepts,
    confidenceSummary: buildConfidenceSummary(
      score,
      weakConcepts.length,
      trendDelta,
    ),
    nextBestFocus,
    roadmap,
    trend: {
      deltaScore: trendDelta,
      attemptCount: options.history.length + 1,
    },
    generatedAt: new Date().toISOString(),
  };
}
