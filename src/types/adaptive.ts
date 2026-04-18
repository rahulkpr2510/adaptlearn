export type TrackKey = "dsa" | "sql" | "javascript-fundamentals";

export type QuestionDifficulty = "easy" | "medium" | "hard";

export type QuizMode = "diagnostic" | "follow-up";

export type ConceptStatus = "Strong" | "Improving" | "Weak";

export type ConceptDifficultyLevel = "foundation" | "intermediate" | "advanced";

export interface Track {
  key: TrackKey;
  label: string;
  description: string;
  icon: string;
  conceptIds: string[];
}

export interface Concept {
  id: string;
  track: TrackKey;
  name: string;
  prerequisites: string[];
  learningObjectives: string[];
  revisionNotes: string;
  practiceTasks: string[];
  retestGoal: string;
  difficultyLevel: ConceptDifficultyLevel;
}

export interface Question {
  id: string;
  track: TrackKey;
  conceptTags: string[];
  difficulty: QuestionDifficulty;
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface QuizSession {
  id: string;
  trackKey: TrackKey;
  mode: QuizMode;
  questions: Question[];
  startedAt: string;
}

export interface ConceptPerformance {
  conceptId: string;
  conceptName: string;
  total: number;
  correct: number;
  accuracy: number;
  status: ConceptStatus;
  prerequisiteGap: boolean;
}

export interface RoadmapStep {
  conceptId: string;
  conceptName: string;
  reason: string;
  whyNow: string;
  prerequisiteRepair: boolean;
  studyFocus: string;
  practicePlan: string[];
  retestCriteria: string;
}

export interface PersonalizedRoadmap {
  summary: string;
  steps: RoadmapStep[];
  followUpQuizConcepts: string[];
  estimatedSessions: number;
}

export interface DiagnosisTrend {
  deltaScore: number;
  attemptCount: number;
}

export interface DiagnosisResult {
  id: string;
  trackKey: TrackKey;
  mode: QuizMode;
  score: number;
  correctCount: number;
  totalQuestions: number;
  conceptPerformance: ConceptPerformance[];
  strongConcepts: string[];
  improvingConcepts: string[];
  weakConcepts: string[];
  confidenceSummary: string;
  nextBestFocus: string;
  roadmap: PersonalizedRoadmap;
  trend: DiagnosisTrend;
  generatedAt: string;
}

export type AnswerMap = Record<string, number>;

export interface AttemptRecord {
  id: string;
  trackKey: TrackKey;
  mode: QuizMode;
  questions: Question[];
  answers: AnswerMap;
  diagnosis: DiagnosisResult;
  completedAt: string;
}
