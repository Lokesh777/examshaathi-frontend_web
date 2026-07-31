// Defensive shape normalizers: the backend returns several envelope variants.
import type { AttemptResponse, RealPaper } from "@/types/api";

/** Unwraps either `{ success, data }` or a bare payload. */
export function unwrap<T>(res: { data: T } | T): T {
  if (res && typeof res === "object" && "data" in (res as Record<string, unknown>)) {
    return (res as { data: T }).data;
  }
  return res as T;
}

function isRealPaperLike(value: unknown): value is RealPaper {
  return Boolean(
    value &&
      typeof value === "object" &&
      (typeof (value as { _id?: unknown })._id === "string" ||
        typeof (value as { quizId?: unknown }).quizId === "string"),
  );
}

type RealPaperEnvelope = {
  data?: unknown;
  papers?: unknown;
  items?: unknown;
  quizzes?: unknown;
  realPapers?: unknown;
  paper?: unknown;
  quiz?: unknown;
};

export function normalizeRealPapers(value: unknown): RealPaper[] {
  if (Array.isArray(value)) return value.filter(isRealPaperLike);
  if (!value || typeof value !== "object") return [];

  const obj = value as RealPaperEnvelope;
  for (const candidate of [obj.data, obj.papers, obj.items, obj.quizzes, obj.realPapers]) {
    const papers = normalizeRealPapers(candidate);
    if (papers.length > 0) return papers;
  }

  if (isRealPaperLike(value)) return [value];
  if (isRealPaperLike(obj.paper)) return [obj.paper];
  if (isRealPaperLike(obj.quiz)) return [obj.quiz];
  return [];
}

/** Some attempts return totals only inside `summary` — flatten them. */
export function normalizeAttemptResponse(res: AttemptResponse): AttemptResponse {
  const s = res.summary;
  if (!s) return res;
  return {
    ...res,
    score: res.score ?? s.score,
    totalQuestions:
      res.totalQuestions ??
      s.correctAnswers + s.wrongAnswers + s.unansweredQuestions,
    scorePercent: res.scorePercent ?? s.scorePercent,
  };
}
