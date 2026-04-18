import type { DiagnosisResult, QuizPayload } from "@/types/learning";

const QUIZ_KEY = "adaptive-learning.latest-quiz";
const RESULT_KEY = "adaptive-learning.latest-result";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function saveLatestQuiz(quiz: QuizPayload): void {
  if (!isBrowser()) {
    return;
  }
  window.sessionStorage.setItem(QUIZ_KEY, JSON.stringify(quiz));
}

export function getLatestQuiz(): QuizPayload | null {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.sessionStorage.getItem(QUIZ_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as QuizPayload;
  } catch {
    return null;
  }
}

export function saveLatestResult(result: DiagnosisResult): void {
  if (!isBrowser()) {
    return;
  }
  window.sessionStorage.setItem(RESULT_KEY, JSON.stringify(result));
}

export function getLatestResult(): DiagnosisResult | null {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.sessionStorage.getItem(RESULT_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as DiagnosisResult;
  } catch {
    return null;
  }
}
