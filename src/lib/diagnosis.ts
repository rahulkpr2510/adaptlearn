import { CONCEPT_MAP } from "@/data/concepts";
import type {
  AnswerMap,
  ConceptLevel,
  ConceptStat,
  DiagnosisResult,
  QuizPayload,
  RoadmapItem,
  RoadmapPlan,
} from "@/types/learning";

export interface DiagnosisHistoryContext {
  attemptsCount: number;
  masteryHistory: number[];
  conceptMasteryHistory: Record<string, number[]>;
  weakConceptFrequency: Record<string, number>;
}

function classifyMastery(mastery: number): ConceptLevel {
  if (mastery >= 80) {
    return "Strong";
  }
  if (mastery >= 50) {
    return "Improving";
  }
  return "Weak";
}

function roundPercent(value: number): number {
  return Math.round(value * 100) / 100;
}

function average(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  return roundPercent(total / values.length);
}

function buildConceptStats(
  quiz: QuizPayload,
  answers: AnswerMap,
): ConceptStat[] {
  const statMap = new Map<string, { total: number; correct: number }>();

  for (const topic of quiz.topics) {
    statMap.set(topic, { total: 0, correct: 0 });
  }

  for (const question of quiz.questions) {
    const answer = answers[question.id];
    const isCorrect = answer === question.correctAnswer;

    for (const concept of question.tags) {
      if (!statMap.has(concept)) {
        statMap.set(concept, { total: 0, correct: 0 });
      }
      const current = statMap.get(concept);
      if (!current) {
        continue;
      }

      current.total += 1;
      if (isCorrect) {
        current.correct += 1;
      }
    }
  }

  const stats = Array.from(statMap.entries()).map(([concept, value]) => {
    const mastery =
      value.total === 0 ? 0 : roundPercent((value.correct / value.total) * 100);
    return {
      concept,
      total: value.total,
      correct: value.correct,
      mastery,
      level: classifyMastery(mastery),
    } as ConceptStat;
  });

  return stats.sort((left, right) => left.mastery - right.mastery);
}

function getConceptHistoryInsight(
  concept: string,
  currentMastery: number,
  history?: DiagnosisHistoryContext,
): {
  previousMastery: number | null;
  averageMastery: number | null;
  trendDelta: number | null;
  weakFrequency: number;
  samples: number;
} {
  const masterySeries = history?.conceptMasteryHistory[concept] ?? [];
  const previousMastery =
    masterySeries.length > 0 ? masterySeries[masterySeries.length - 1] : null;
  const averageMastery = average(masterySeries);
  const trendDelta =
    previousMastery === null
      ? null
      : roundPercent(currentMastery - previousMastery);
  const weakFrequency = history?.weakConceptFrequency[concept] ?? 0;

  return {
    previousMastery,
    averageMastery,
    trendDelta,
    weakFrequency,
    samples: masterySeries.length,
  };
}

function buildPriorityConcepts(
  conceptStats: ConceptStat[],
  history?: DiagnosisHistoryContext,
): string[] {
  const statsMap = new Map(conceptStats.map((entry) => [entry.concept, entry]));
  const prioritized = conceptStats
    .map((entry) => {
      const historyInsight = getConceptHistoryInsight(
        entry.concept,
        entry.mastery,
        history,
      );

      const weaknessScore = 100 - entry.mastery;
      const repeatedWeaknessScore = historyInsight.weakFrequency * 7;
      const dropScore =
        historyInsight.trendDelta !== null && historyInsight.trendDelta < 0
          ? Math.abs(historyInsight.trendDelta)
          : 0;
      const stagnationScore =
        historyInsight.previousMastery !== null &&
        entry.mastery <= historyInsight.previousMastery
          ? 6
          : 0;
      const levelScore =
        entry.level === "Weak" ? 12 : entry.level === "Improving" ? 5 : 0;

      return {
        entry,
        priorityScore:
          weaknessScore +
          repeatedWeaknessScore +
          dropScore +
          stagnationScore +
          levelScore,
      };
    })
    .filter(
      ({ entry, priorityScore }) =>
        entry.level !== "Strong" || priorityScore >= 20,
    )
    .sort((left, right) => right.priorityScore - left.priorityScore)
    .map(({ entry }) => entry);

  const ordered: string[] = [];

  for (const stat of prioritized) {
    const concept = CONCEPT_MAP.get(stat.concept);
    if (!concept) {
      if (!ordered.includes(stat.concept)) {
        ordered.push(stat.concept);
      }
      continue;
    }

    for (const prerequisite of concept.prerequisites) {
      const prerequisiteStat = statsMap.get(prerequisite);
      if (
        prerequisiteStat &&
        prerequisiteStat.mastery < 75 &&
        !ordered.includes(prerequisite)
      ) {
        ordered.push(prerequisite);
      }
    }

    if (!ordered.includes(stat.concept)) {
      ordered.push(stat.concept);
    }
  }

  if (ordered.length === 0) {
    return conceptStats
      .map((entry) => ({
        concept: entry.concept,
        mastery: entry.mastery,
        weakFrequency: history?.weakConceptFrequency[entry.concept] ?? 0,
      }))
      .sort((left, right) => {
        if (right.weakFrequency !== left.weakFrequency) {
          return right.weakFrequency - left.weakFrequency;
        }
        return left.mastery - right.mastery;
      })
      .slice(0, 3)
      .map((entry) => entry.concept);
  }

  return ordered.slice(0, 3);
}

function buildRoadmapItems(
  conceptStats: ConceptStat[],
  history?: DiagnosisHistoryContext,
): RoadmapItem[] {
  const statsByConcept = new Map(
    conceptStats.map((conceptStat) => [conceptStat.concept, conceptStat]),
  );

  const priorities = buildPriorityConcepts(conceptStats, history);

  return priorities.map((conceptName) => {
    const stat = statsByConcept.get(conceptName);
    const concept = CONCEPT_MAP.get(conceptName);

    const total = stat?.total ?? 0;
    const incorrect = total - (stat?.correct ?? 0);
    const currentMastery = stat?.mastery ?? 0;
    const level = stat?.level ?? "Strong";
    const isStrongNow = level === "Strong" && incorrect <= 0;
    const historyInsight = getConceptHistoryInsight(
      conceptName,
      currentMastery,
      history,
    );

    const trendNarrative =
      historyInsight.trendDelta === null
        ? "No historical baseline yet for this concept."
        : historyInsight.trendDelta > 0
          ? `Mastery improved by ${Math.round(historyInsight.trendDelta)} points since your previous attempt.`
          : historyInsight.trendDelta < 0
            ? `Mastery dropped by ${Math.round(Math.abs(historyInsight.trendDelta))} points from your previous attempt.`
            : "Mastery is flat versus your previous attempt.";

    const recurrenceNarrative =
      historyInsight.weakFrequency >= 2
        ? `This concept has remained weak in ${historyInsight.weakFrequency} recent attempts.`
        : historyInsight.weakFrequency === 1
          ? "This concept was also weak in your last attempt."
          : isStrongNow
            ? "This concept is currently stable in your latest attempt."
            : "This is a newly detected weak area in the current attempt.";

    const revisionFocus =
      currentMastery < 40
        ? "Start from fundamentals and write each state transition manually."
        : currentMastery < 70
          ? "Focus on pattern recognition and boundary-case handling."
          : "Focus on speed, confidence, and reducing small mistakes under time pressure.";

    const historyFocus =
      historyInsight.averageMastery === null
        ? "Create your first baseline with one timed drill before moving to harder sets."
        : `Your recent average on this concept is ${Math.round(historyInsight.averageMastery)}%.`;

    const dynamicTasks = [
      ...(concept?.practiceSteps.slice(0, 2) ?? [
        "Solve 3 easy practice problems.",
        "Solve 2 medium practice problems.",
      ]),
      `Run a ${Math.max(15, 30 - Math.min(10, incorrect * 2))}-minute focused set of ${Math.max(
        4,
        Math.min(8, total + 2),
      )} ${conceptName} questions and review every miss.`,
      historyInsight.weakFrequency >= 2
        ? `Write a short mistake log for ${conceptName}: list 3 repeated errors from recent attempts and one fix for each.`
        : `After each ${conceptName} problem, note one invariant or checkpoint before coding the final answer.`,
      historyInsight.trendDelta !== null && historyInsight.trendDelta < 0
        ? `Revisit the last failed ${conceptName} pattern first, then solve one easier and one medium follow-up question.`
        : `Attempt one medium ${conceptName} question without hints and compare your approach against your previous attempt.`,
    ];

    const uniqueTasks = Array.from(
      new Set(dynamicTasks.map((task) => task.trim())),
    )
      .filter((task) => task.length > 0)
      .slice(0, 4);

    const retestHours =
      (currentMastery < 40 ? 24 : currentMastery < 70 ? 36 : 48) +
      (historyInsight.weakFrequency >= 2 ? 12 : 0);

    const whyWeak =
      total === 0
        ? `${recurrenceNarrative} ${trendNarrative}`
        : isStrongNow
          ? `${stat?.correct ?? total} of ${total} tagged questions were correct. ${recurrenceNarrative} ${trendNarrative}`
          : `${incorrect} of ${total} tagged questions were incorrect. ${recurrenceNarrative} ${trendNarrative}`;

    return {
      concept: conceptName,
      mastery: currentMastery,
      whyWeak,
      whatToStudy: `${
        concept?.revisionResource ??
        "Review core definitions and solve a few warm-up problems before timed practice."
      } ${revisionFocus} ${historyFocus}`,
      practiceTasks: uniqueTasks,
      retestAfter: `Retest ${conceptName} in about ${retestHours} hours using a timed ${Math.max(
        5,
        Math.min(10, total + 2),
      )}-question set.`,
      prerequisites: concept?.prerequisites ?? [],
    };
  });
}

async function buildRoadmap(
  conceptStats: ConceptStat[],
  context: {
    overallMastery: number;
    totalQuestions: number;
    correctCount: number;
    history?: DiagnosisHistoryContext;
  },
): Promise<RoadmapPlan> {
  const priorityConcepts = buildRoadmapItems(conceptStats, context.history);
  const prioritizedConceptLabels = priorityConcepts
    .map((item) => item.concept)
    .slice(0, 2)
    .join(", ");
  const allPrioritiesStrong = priorityConcepts.every(
    (item) => item.mastery >= 80,
  );

  const previousMastery =
    context.history && context.history.masteryHistory.length > 0
      ? context.history.masteryHistory[
          context.history.masteryHistory.length - 1
        ]
      : null;

  const masteryDeltaText =
    previousMastery === null
      ? "This is your first persisted benchmark for this track."
      : context.overallMastery >= previousMastery
        ? `Overall mastery improved by ${Math.round(
            context.overallMastery - previousMastery,
          )} points from your previous attempt.`
        : `Overall mastery dropped by ${Math.round(
            previousMastery - context.overallMastery,
          )} points from your previous attempt.`;

  const weakestMastery = priorityConcepts[0]?.mastery ?? context.overallMastery;
  const retestHours = weakestMastery < 40 ? 24 : weakestMastery < 70 ? 36 : 48;
  const historyCount = context.history?.attemptsCount ?? 0;
  const historyMarker =
    historyCount > 0
      ? `Built using ${historyCount} prior attempt${historyCount === 1 ? "" : "s"}.`
      : "Built from your first persisted attempt snapshot.";

  const summary = allPrioritiesStrong
    ? `${context.correctCount}/${context.totalQuestions} correct (${Math.round(
        context.overallMastery,
      )}% mastery). Maintain strengths in ${prioritizedConceptLabels || "your core concepts"} with timed mixed-difficulty practice. ${masteryDeltaText} ${historyMarker}`
    : `${context.correctCount}/${context.totalQuestions} correct (${Math.round(
        context.overallMastery,
      )}% mastery). Focus next on ${prioritizedConceptLabels || "your weakest concepts"}. ${masteryDeltaText} ${historyMarker}`;

  return {
    generatedAt: new Date().toISOString(),
    priorityConcepts,
    summary,
    retestSuggestion: allPrioritiesStrong
      ? `Retest in about ${retestHours} hours with an 8-10 question mixed set to preserve gains in ${prioritizedConceptLabels || "core concepts"}.`
      : `After completing roadmap tasks, retest in about ${retestHours} hours with an 8-10 question focused quiz on ${prioritizedConceptLabels || "weak concepts"}.`,
  };
}

export async function diagnoseQuiz(
  quiz: QuizPayload,
  answers: AnswerMap,
  history?: DiagnosisHistoryContext,
): Promise<DiagnosisResult> {
  const totalQuestions = quiz.questions.length;
  const answeredCount = quiz.questions.filter((question) =>
    Number.isInteger(answers[question.id]),
  ).length;
  const correctCount = quiz.questions.filter(
    (question) => answers[question.id] === question.correctAnswer,
  ).length;
  const overallMastery =
    totalQuestions === 0
      ? 0
      : roundPercent((correctCount / totalQuestions) * 100);

  const conceptStats = buildConceptStats(quiz, answers);

  return {
    overallMastery,
    correctCount,
    answeredCount,
    totalQuestions,
    strongConcepts: conceptStats
      .filter((entry) => entry.level === "Strong")
      .map((entry) => entry.concept),
    improvingConcepts: conceptStats
      .filter((entry) => entry.level === "Improving")
      .map((entry) => entry.concept),
    weakConcepts: conceptStats
      .filter((entry) => entry.level === "Weak")
      .map((entry) => entry.concept),
    conceptStats,
    roadmap: await buildRoadmap(conceptStats, {
      overallMastery,
      totalQuestions,
      correctCount,
      history,
    }),
  };
}
