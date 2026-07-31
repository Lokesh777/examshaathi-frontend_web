import type { AttemptResponse } from "@/types/api";

export type StoredAttempt = AttemptResponse & {
  quizId: string;
  paperTitle?: string;
  timeTakenSeconds?: number;
  submittedAt?: number;
};

let cached: StoredAttempt | null = null;
const KEY = "examsaathi.lastAttempt";

export function setLastAttempt(
  quizId: string,
  data: AttemptResponse,
  extra: { paperTitle?: string; timeTakenSeconds?: number } = {},
) {
  cached = {
    ...data,
    quizId,
    paperTitle: extra.paperTitle,
    timeTakenSeconds: extra.timeTakenSeconds ?? data.timeTakenSeconds,
    submittedAt: Date.now(),
  };
  try {
    sessionStorage.setItem(KEY, JSON.stringify(cached));
  } catch {
    /* ignore */
  }
}

export function getLastAttempt(): StoredAttempt | null {
  if (cached) return cached;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) cached = JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return cached;
}

export function clearLastAttempt() {
  cached = null;
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}