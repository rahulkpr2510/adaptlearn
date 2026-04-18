import { generateQuiz, QuizGenerationError } from "@/lib/quiz-generator";
import { splitCodingTopics } from "@/lib/topic-guard";
import type { QuizMode } from "@/types/learning";

export const dynamic = "force-dynamic";

interface GenerateQuizRequestBody {
  trackId?: unknown;
  questionCount?: unknown;
  topics?: unknown;
  focusTopics?: unknown;
  mode?: unknown;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as GenerateQuizRequestBody;

    const trackId =
      typeof body.trackId === "string" && body.trackId.trim().length > 0
        ? body.trackId
        : "dsa-interview-prep";

    const questionCount =
      typeof body.questionCount === "number" &&
      Number.isFinite(body.questionCount)
        ? body.questionCount
        : 10;

    const mode: QuizMode = body.mode === "demo" ? "demo" : "standard";
    const requestedTopics = toStringArray(body.topics);
    const requestedFocusTopics = toStringArray(body.focusTopics);

    if (mode === "standard") {
      const { validTopics, invalidTopics } = splitCodingTopics([
        ...requestedTopics,
        ...requestedFocusTopics,
      ]);

      if (invalidTopics.length > 0) {
        return Response.json(
          {
            error:
              "Only coding-related topics are supported. Remove non-coding entries and try again.",
            invalidTopics,
          },
          { status: 400 },
        );
      }

      if (validTopics.length === 0) {
        return Response.json(
          {
            error:
              "Enter at least one coding topic (for example: Dynamic Programming, React, SQL).",
          },
          { status: 400 },
        );
      }
    }

    const quiz = await generateQuiz({
      trackId,
      questionCount,
      topics: requestedTopics,
      focusTopics: requestedFocusTopics,
      mode,
    });

    return Response.json({ quiz });
  } catch (error) {
    if (error instanceof QuizGenerationError) {
      return Response.json({ error: error.message }, { status: 503 });
    }

    return Response.json(
      { error: "Could not generate quiz right now." },
      { status: 500 },
    );
  }
}
