import { DEMO_DIAGNOSIS_RESULT } from "@/data/demo";
import { getCurrentUser } from "@/lib/auth";
import { diagnoseQuiz } from "@/lib/diagnosis";
import { prisma } from "@/lib/prisma";
import type {
  AnswerMap,
  ConceptStat,
  QuizMode,
  QuizPayload,
} from "@/types/learning";

export const dynamic = "force-dynamic";

interface DiagnosisRequestBody {
  quiz?: unknown;
  answers?: unknown;
  mode?: unknown;
  useDemoResult?: unknown;
}

function isQuizPayload(value: unknown): value is QuizPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<QuizPayload>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.trackId === "string" &&
    typeof candidate.domain === "string" &&
    Array.isArray(candidate.questions)
  );
}

function isAnswerMap(value: unknown): value is AnswerMap {
  if (!value || typeof value !== "object") {
    return false;
  }
  return true;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function toConceptStats(value: unknown): ConceptStat[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        return null;
      }

      const candidate = entry as Record<string, unknown>;
      if (
        typeof candidate.concept !== "string" ||
        typeof candidate.total !== "number" ||
        typeof candidate.correct !== "number" ||
        typeof candidate.mastery !== "number" ||
        (candidate.level !== "Strong" &&
          candidate.level !== "Improving" &&
          candidate.level !== "Weak")
      ) {
        return null;
      }

      return {
        concept: candidate.concept,
        total: candidate.total,
        correct: candidate.correct,
        mastery: candidate.mastery,
        level: candidate.level,
      } satisfies ConceptStat;
    })
    .filter((entry): entry is ConceptStat => Boolean(entry));
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as DiagnosisRequestBody;
    const mode: QuizMode = body.mode === "demo" ? "demo" : "standard";
    const useDemoResult = body.useDemoResult === true;

    if (mode === "demo" && useDemoResult) {
      return Response.json({ result: DEMO_DIAGNOSIS_RESULT });
    }

    if (!isQuizPayload(body.quiz) || !isAnswerMap(body.answers)) {
      return Response.json(
        { error: "Invalid diagnosis payload." },
        { status: 400 },
      );
    }

    let historyContext:
      | {
          attemptsCount: number;
          masteryHistory: number[];
          conceptMasteryHistory: Record<string, number[]>;
          weakConceptFrequency: Record<string, number>;
        }
      | undefined;

    if (mode === "standard") {
      const user = await getCurrentUser();

      if (user) {
        const historicalAttempts = await prisma.quizAttempt.findMany({
          where: {
            userId: user.id,
            trackId: body.quiz.trackId,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 15,
          select: {
            overallMastery: true,
            conceptStats: true,
            weakConcepts: true,
          },
        });

        const orderedAttempts = [...historicalAttempts].reverse();
        const conceptMasteryHistory: Record<string, number[]> = {};
        const weakConceptFrequency: Record<string, number> = {};

        for (const attempt of orderedAttempts) {
          const parsedStats = toConceptStats(attempt.conceptStats);
          for (const stat of parsedStats) {
            if (!conceptMasteryHistory[stat.concept]) {
              conceptMasteryHistory[stat.concept] = [];
            }
            conceptMasteryHistory[stat.concept]?.push(stat.mastery);
          }

          for (const concept of toStringArray(attempt.weakConcepts)) {
            weakConceptFrequency[concept] =
              (weakConceptFrequency[concept] ?? 0) + 1;
          }
        }

        historyContext = {
          attemptsCount: orderedAttempts.length,
          masteryHistory: orderedAttempts.map(
            (attempt) => attempt.overallMastery,
          ),
          conceptMasteryHistory,
          weakConceptFrequency,
        };
      }
    }

    const result = await diagnoseQuiz(body.quiz, body.answers, historyContext);
    return Response.json({ result });
  } catch {
    return Response.json(
      { error: "Could not compute diagnosis right now." },
      { status: 500 },
    );
  }
}
