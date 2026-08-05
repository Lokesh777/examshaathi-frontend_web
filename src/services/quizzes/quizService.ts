// Quiz, attempt and leaderboard API calls.
import { api } from "@/services/api/axiosInstance";
import { ENDPOINTS } from "@/services/api/endpoints";
import {
  normalizeAttemptResponse,
  normalizeRealPapers,
  unwrap,
} from "@/lib/normalizers";
import type {
  AttemptResponse,
  BankQuestionSummary,
  BankShortfall,
  Envelope,
  LeaderboardResponse,
  QuizFetchResponse,
  RealPaper,
  SubmitAnswer,
} from "@/types/api";

export type GenerateMode = "normal" | "new" | "mixed";

export type GenerateTopicResult = {
  success: boolean;
  inserted: number;
  finalCount: number;
  mode: GenerateMode;
  topicId: string;
};

export type CreateRealPaperResult = RealPaper & {
  success?: boolean;
  quizId?: string;
  title?: string;
  totalQuestions?: number;
  questions?: unknown[];
  shortfalls?: BankShortfall[];
};

export async function fetchTopicQuiz(
  examId: string,
  topicId: string,
  count?: number,
): Promise<QuizFetchResponse> {
  const { data } = await api.post<QuizFetchResponse>(
    ENDPOINTS.quizzes.topicQuiz(examId, topicId),
    {},
    { params: count ? { count } : undefined },
  );
  return data;
}

export async function listTopicQuizzes(
  examId: string,
  topicId: string,
): Promise<RealPaper[]> {
  const path =
    typeof ENDPOINTS.quizzes.topicQuizzes === "function"
      ? ENDPOINTS.quizzes.topicQuizzes(examId, topicId)
      : `/quiz/exams/${examId}/topics/${topicId}/quizzes`;
  const { data } = await api.get<Envelope<RealPaper[]> | { success: boolean; data: RealPaper[] }>(
    path,
  );
  return unwrap<RealPaper[]>(data as Envelope<RealPaper[]>);
}

export async function listTopicBankQuestions(
  examId: string,
  topicId: string,
): Promise<BankQuestionSummary[]> {
  const path =
    typeof ENDPOINTS.quizzes.topicQuestions === "function"
      ? ENDPOINTS.quizzes.topicQuestions(examId, topicId)
      : `/quiz/exams/${examId}/topics/${topicId}/questions`;
  const { data } = await api.get<Envelope<BankQuestionSummary[]>>(path);
  return unwrap(data);
}

export async function deleteQuiz(quizId: string): Promise<void> {
  await api.delete(ENDPOINTS.quizzes.quizById(quizId));
}

export async function deleteQuestion(questionId: string): Promise<void> {
  const path =
    typeof ENDPOINTS.quizzes.questionById === "function"
      ? ENDPOINTS.quizzes.questionById(questionId)
      : `/quiz/questions/${questionId}`;
  await api.delete(path);
}

export async function generateTopicQuestions(
  examId: string,
  topicId: string,
  payload: { mode: GenerateMode; count: number },
): Promise<GenerateTopicResult> {
  // Prefer ENDPOINTS helper; fall back to path string if a stale bundle omits it.
  const path =
    typeof ENDPOINTS.quizzes.topicGenerate === "function"
      ? ENDPOINTS.quizzes.topicGenerate(examId, topicId)
      : `/quiz/exams/${examId}/topics/${topicId}/generate`;
  const { data } = await api.post<GenerateTopicResult>(path, {
    ...payload,
    count: Math.min(20, Math.max(10, Number(payload.count) || 10)),
  });
  if (!data?.success) {
    throw new Error((data as { message?: string })?.message || "Generation failed");
  }
  return data;
}

export async function fetchRealPapers(examId: string): Promise<RealPaper[]> {
  const { data } = await api.get<unknown>(ENDPOINTS.quizzes.realPaper(examId));
  return normalizeRealPapers(data);
}

export async function createRealPaper(
  examId: string,
  payload: { title: string; userId?: string },
): Promise<CreateRealPaperResult> {
  const { data } = await api.post<CreateRealPaperResult>(
    ENDPOINTS.quizzes.realPaper(examId),
    payload,
  );
  if (data && typeof data === "object" && "data" in data) {
    return unwrap<CreateRealPaperResult>(data as Envelope<CreateRealPaperResult>);
  }
  return data;
}

export async function fetchQuizById(quizId: string): Promise<QuizFetchResponse> {
  const { data } = await api.get<QuizFetchResponse>(
    ENDPOINTS.quizzes.quizById(quizId),
  );
  return data;
}

export async function renameQuiz(quizId: string, title: string) {
  const { data } = await api.patch<{ success: boolean; data?: RealPaper }>(
    ENDPOINTS.quizzes.quizById(quizId),
    { title },
  );
  return data;
}

export async function submitQuizAttempt(
  quizId: string,
  payload: { answers: SubmitAnswer[]; timeTakenSeconds: number },
): Promise<AttemptResponse> {
  const { data } = await api.post<AttemptResponse>(
    ENDPOINTS.quizzes.attempt(quizId),
    payload,
  );
  return normalizeAttemptResponse(data);
}

export async function fetchQuizLeaderboard(
  quizId: string,
): Promise<LeaderboardResponse> {
  const { data } = await api.get<LeaderboardResponse>(
    ENDPOINTS.quizzes.leaderboard(quizId),
  );
  return data;
}

export type DailyStreakSummary = {
  current: number;
  longest: number;
  lastCompletedDate?: string | null;
  today: string;
  completedToday: boolean;
  attemptedToday?: boolean;
  quizId?: string | null;
};

export type DailyChallengeResponse = {
  success: boolean;
  quizId: string;
  title: string;
  totalQuestions: number;
  durationMinutes: number;
  questions: import("@/types/api").QuizQuestion[];
  attempted: boolean;
  lastScorePercent?: number | null;
  completedToday: boolean;
  streak: DailyStreakSummary;
};

export async function fetchDailyStreak(examId: string): Promise<DailyStreakSummary> {
  const path =
    typeof ENDPOINTS.quizzes.streak === "function"
      ? ENDPOINTS.quizzes.streak(examId)
      : `/quiz/exams/${examId}/streak`;
  const { data } = await api.get<Envelope<DailyStreakSummary>>(path);
  return unwrap(data);
}

export async function startDailyChallenge(examId: string): Promise<DailyChallengeResponse> {
  const path =
    typeof ENDPOINTS.quizzes.daily === "function"
      ? ENDPOINTS.quizzes.daily(examId)
      : `/quiz/exams/${examId}/daily`;
  const { data } = await api.get<DailyChallengeResponse>(path);
  return data;
}
