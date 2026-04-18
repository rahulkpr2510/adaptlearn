import type {
  AttemptRecord,
  DiagnosisResult,
  QuizSession,
  TrackKey,
} from "@/types/adaptive";

interface AdaptiveStore {
  attempts: AttemptRecord[];
  activeSession: QuizSession | null;
}

const STORAGE_KEY = "adaptive-learning.store.v1";
const MAX_ATTEMPTS = 60;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function getDefaultStore(): AdaptiveStore {
  return {
    attempts: [],
    activeSession: null,
  };
}

function readStore(): AdaptiveStore {
  if (!isBrowser()) {
    return getDefaultStore();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return getDefaultStore();
  }

  try {
    const parsed = JSON.parse(raw) as AdaptiveStore;
    return {
      attempts: Array.isArray(parsed.attempts) ? parsed.attempts : [],
      activeSession: parsed.activeSession ?? null,
    };
  } catch {
    return getDefaultStore();
  }
}

function writeStore(store: AdaptiveStore): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function saveActiveQuizSession(session: QuizSession): void {
  const store = readStore();
  writeStore({
    ...store,
    activeSession: session,
  });
}

export function getActiveQuizSession(): QuizSession | null {
  return readStore().activeSession;
}

export function clearActiveQuizSession(): void {
  const store = readStore();
  writeStore({
    ...store,
    activeSession: null,
  });
}

export function saveAttemptRecord(record: AttemptRecord): void {
  const store = readStore();
  const nextAttempts = [...store.attempts, record].slice(-MAX_ATTEMPTS);
  writeStore({
    attempts: nextAttempts,
    activeSession: null,
  });
}

export function getAttemptHistory(trackKey?: TrackKey): AttemptRecord[] {
  const attempts = readStore().attempts;
  if (!trackKey) {
    return attempts;
  }

  return attempts.filter((attempt) => attempt.trackKey === trackKey);
}

export function getLatestAttempt(trackKey: TrackKey): AttemptRecord | null {
  const attempts = getAttemptHistory(trackKey);
  return attempts.at(-1) ?? null;
}

export function getLatestDiagnosis(trackKey: TrackKey): DiagnosisResult | null {
  const latestAttempt = getLatestAttempt(trackKey);
  return latestAttempt?.diagnosis ?? null;
}

export function getRecentQuestionIds(trackKey: TrackKey, limit = 14): string[] {
  const attempts = getAttemptHistory(trackKey).slice(-3);
  const ids = attempts.flatMap((attempt) =>
    attempt.questions.map((question) => question.id),
  );
  return Array.from(new Set(ids)).slice(-limit);
}

export function getTrackSummary(trackKey: TrackKey): {
  attemptCount: number;
  latestScore: number | null;
  averageScore: number | null;
} {
  const attempts = getAttemptHistory(trackKey);

  if (attempts.length === 0) {
    return {
      attemptCount: 0,
      latestScore: null,
      averageScore: null,
    };
  }

  const latestScore = attempts.at(-1)?.diagnosis.score ?? null;
  const total = attempts.reduce(
    (sum, attempt) => sum + attempt.diagnosis.score,
    0,
  );

  return {
    attemptCount: attempts.length,
    latestScore,
    averageScore: Math.round((total / attempts.length) * 100) / 100,
  };
}
