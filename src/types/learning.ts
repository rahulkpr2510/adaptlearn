export type Difficulty = "easy" | "medium" | "hard";

export type ConceptLevel = "Strong" | "Improving" | "Weak";

export type QuizMode = "standard" | "demo";

export type QuizSource = "ai" | "fallback" | "demo" | "hybrid";

export interface LearningTrack {
  id: string;
  name: string;
  domain: string;
  summary: string;
  topics: string[];
  defaultQuestionCount: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: Difficulty;
  tags: string[];
}

export interface QuizPayload {
  id: string;
  trackId: string;
  domain: string;
  topics: string[];
  questions: QuizQuestion[];
  generatedBy: QuizSource;
  generatedAt: string;
  targetQuestionCount?: number;
  adaptive?: boolean;
}

export interface ConceptDefinition {
  name: string;
  prerequisites: string[];
  practiceSteps: string[];
  revisionResource: string;
}

export interface ConceptStat {
  concept: string;
  total: number;
  correct: number;
  mastery: number;
  level: ConceptLevel;
}

export interface RoadmapItem {
  concept: string;
  mastery: number;
  whyWeak: string;
  whatToStudy: string;
  practiceTasks: string[];
  retestAfter: string;
  prerequisites: string[];
}

export interface RoadmapPlan {
  generatedAt: string;
  priorityConcepts: RoadmapItem[];
  retestSuggestion: string;
  summary: string;
}

export interface DiagnosisResult {
  overallMastery: number;
  correctCount: number;
  answeredCount: number;
  totalQuestions: number;
  strongConcepts: string[];
  improvingConcepts: string[];
  weakConcepts: string[];
  conceptStats: ConceptStat[];
  roadmap: RoadmapPlan;
}

export type AnswerMap = Record<string, number>;
