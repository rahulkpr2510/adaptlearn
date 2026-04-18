import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const conceptStatSchema = z.object({
  concept: z.string().trim().min(1).max(80),
  total: z.number().int().min(0).max(200),
  correct: z.number().int().min(0).max(200),
  mastery: z.number().min(0).max(100),
  level: z.enum(["Strong", "Improving", "Weak"]),
});

const roadmapItemSchema = z.object({
  concept: z.string().trim().min(1).max(80),
  mastery: z.number().min(0).max(100),
  whyWeak: z.string().trim().min(1).max(600),
  whatToStudy: z.string().trim().min(1).max(600),
  practiceTasks: z.array(z.string().trim().min(1).max(300)).min(1).max(6),
  retestAfter: z.string().trim().min(1).max(300),
  prerequisites: z.array(z.string().trim().min(1).max(80)).max(8),
});

const roadmapSchema = z.object({
  generatedAt: z.string().trim().min(1).max(80),
  summary: z.string().trim().min(1).max(800),
  retestSuggestion: z.string().trim().min(1).max(500),
  priorityConcepts: z.array(roadmapItemSchema).max(6),
});

const payloadSchema = z.object({
  quiz: z.object({
    trackId: z.string().trim().min(1).max(80),
  }),
  result: z.object({
    overallMastery: z.number().min(0).max(100),
    correctCount: z.number().int().min(0).max(200),
    totalQuestions: z.number().int().min(1).max(200),
    strongConcepts: z.array(z.string().trim().min(1).max(80)).max(20),
    improvingConcepts: z.array(z.string().trim().min(1).max(80)).max(20),
    weakConcepts: z.array(z.string().trim().min(1).max(80)).max(20),
    conceptStats: z.array(conceptStatSchema).max(40),
    roadmap: roadmapSchema,
  }),
});

export async function POST(request: Request): Promise<Response> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ error: "Unauthorized." }, { status: 401 });
    }

    const json = (await request.json()) as unknown;
    const parsed = payloadSchema.safeParse(json);

    if (!parsed.success) {
      return Response.json(
        { error: "Invalid progress payload." },
        { status: 400 },
      );
    }

    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: user.id,
        trackId: parsed.data.quiz.trackId,
        correctCount: parsed.data.result.correctCount,
        totalQuestions: parsed.data.result.totalQuestions,
        overallMastery: parsed.data.result.overallMastery,
        strongConcepts: parsed.data.result.strongConcepts,
        improvingConcepts: parsed.data.result.improvingConcepts,
        weakConcepts: parsed.data.result.weakConcepts,
        conceptStats: parsed.data.result.conceptStats,
        roadmap: parsed.data.result.roadmap,
      },
      select: {
        id: true,
      },
    });

    return Response.json({ attemptId: attempt.id });
  } catch {
    return Response.json(
      { error: "Could not save progress right now." },
      { status: 500 },
    );
  }
}
