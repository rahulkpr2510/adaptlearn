import "server-only";

import { prisma } from "@/lib/prisma";
import type { ConceptStat, RoadmapPlan } from "@/types/learning";

export interface DashboardTrendPoint {
  label: string;
  mastery: number;
  score: number;
}

export interface DashboardMasteryBand {
  name: "Strong" | "Improving" | "Weak";
  value: number;
}

export interface DashboardSummary {
  attemptsCount: number;
  latestMastery: number;
  averageMastery: number;
  improvementDelta: number;
  streak: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  trend: DashboardTrendPoint[];
  latestConceptStats: ConceptStat[];
  masteryBands: DashboardMasteryBand[];
  latestRoadmap: RoadmapPlan | null;
  recentAttempts: Array<{
    id: string;
    createdAt: string;
    mastery: number;
    scoreLabel: string;
  }>;
}

function toConceptStats(value: unknown): ConceptStat[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const record = entry as Record<string, unknown>;
      if (
        typeof record.concept !== "string" ||
        typeof record.total !== "number" ||
        typeof record.correct !== "number" ||
        typeof record.mastery !== "number" ||
        (record.level !== "Strong" &&
          record.level !== "Improving" &&
          record.level !== "Weak")
      ) {
        return null;
      }

      return {
        concept: record.concept,
        total: record.total,
        correct: record.correct,
        mastery: record.mastery,
        level: record.level,
      } satisfies ConceptStat;
    })
    .filter((entry): entry is ConceptStat => Boolean(entry));
}

function toRoadmapPlan(value: unknown): RoadmapPlan | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;
  if (
    typeof record.generatedAt !== "string" ||
    typeof record.summary !== "string" ||
    typeof record.retestSuggestion !== "string" ||
    !Array.isArray(record.priorityConcepts)
  ) {
    return null;
  }

  return {
    generatedAt: record.generatedAt,
    summary: record.summary,
    retestSuggestion: record.retestSuggestion,
    priorityConcepts: record.priorityConcepts
      .map((entry) => {
        if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
          return null;
        }

        const item = entry as Record<string, unknown>;
        if (
          typeof item.concept !== "string" ||
          typeof item.mastery !== "number" ||
          typeof item.whyWeak !== "string" ||
          typeof item.whatToStudy !== "string" ||
          typeof item.retestAfter !== "string" ||
          !Array.isArray(item.practiceTasks) ||
          !Array.isArray(item.prerequisites)
        ) {
          return null;
        }

        return {
          concept: item.concept,
          mastery: item.mastery,
          whyWeak: item.whyWeak,
          whatToStudy: item.whatToStudy,
          retestAfter: item.retestAfter,
          practiceTasks: item.practiceTasks.filter(
            (task): task is string => typeof task === "string",
          ),
          prerequisites: item.prerequisites.filter(
            (topic): topic is string => typeof topic === "string",
          ),
        };
      })
      .filter((entry): entry is RoadmapPlan["priorityConcepts"][number] =>
        Boolean(entry),
      ),
  };
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is string => typeof entry === "string");
}

function formatDateLabel(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function computeStreak(values: number[]): number {
  if (values.length < 2) {
    return values.length;
  }

  let streak = 1;
  for (let index = values.length - 1; index > 0; index -= 1) {
    if (values[index] >= values[index - 1]) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}

export async function getDashboardDataForUser(
  userId: string,
): Promise<DashboardData> {
  const attempts = await prisma.quizAttempt.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  if (attempts.length === 0) {
    return {
      summary: {
        attemptsCount: 0,
        latestMastery: 0,
        averageMastery: 0,
        improvementDelta: 0,
        streak: 0,
      },
      trend: [],
      latestConceptStats: [],
      masteryBands: [
        { name: "Strong", value: 0 },
        { name: "Improving", value: 0 },
        { name: "Weak", value: 0 },
      ],
      latestRoadmap: null,
      recentAttempts: [],
    };
  }

  const masteryValues = attempts.map((attempt) => attempt.overallMastery);
  const latestAttempt = attempts[attempts.length - 1];
  const averageMastery =
    masteryValues.reduce((total, value) => total + value, 0) /
    masteryValues.length;

  const trend = attempts.slice(-10).map((attempt, index) => ({
    label: `${formatDateLabel(attempt.createdAt)} · ${index + 1}`,
    mastery: Number(attempt.overallMastery.toFixed(2)),
    score: Number(
      (
        (attempt.correctCount / Math.max(1, attempt.totalQuestions)) *
        100
      ).toFixed(2),
    ),
  }));

  const latestConceptStats = toConceptStats(latestAttempt.conceptStats).sort(
    (a, b) => a.mastery - b.mastery,
  );

  const masteryBands: DashboardMasteryBand[] = [
    {
      name: "Strong",
      value: toStringArray(latestAttempt.strongConcepts).length,
    },
    {
      name: "Improving",
      value: toStringArray(latestAttempt.improvingConcepts).length,
    },
    { name: "Weak", value: toStringArray(latestAttempt.weakConcepts).length },
  ];

  const recentAttempts = [...attempts]
    .reverse()
    .slice(0, 6)
    .map((attempt) => ({
      id: attempt.id,
      createdAt: attempt.createdAt.toISOString(),
      mastery: Number(attempt.overallMastery.toFixed(2)),
      scoreLabel: `${attempt.correctCount}/${attempt.totalQuestions}`,
    }));

  return {
    summary: {
      attemptsCount: attempts.length,
      latestMastery: Number(latestAttempt.overallMastery.toFixed(2)),
      averageMastery: Number(averageMastery.toFixed(2)),
      improvementDelta: Number(
        (latestAttempt.overallMastery - attempts[0].overallMastery).toFixed(2),
      ),
      streak: computeStreak(masteryValues),
    },
    trend,
    latestConceptStats,
    masteryBands,
    latestRoadmap: toRoadmapPlan(latestAttempt.roadmap),
    recentAttempts,
  };
}

export async function getLatestRoadmapForUser(
  userId: string,
): Promise<RoadmapPlan | null> {
  const latestAttempt = await prisma.quizAttempt.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      roadmap: true,
    },
  });

  if (!latestAttempt) {
    return null;
  }

  return toRoadmapPlan(latestAttempt.roadmap);
}
