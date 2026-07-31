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
  Envelope,
  LeaderboardResponse,
  QuizFetchResponse,
  RealPaper,
  SubmitAnswer,
} from "@/types/api";

export async function fetchTopicQuiz(
  examId: string,
  topicId: string,
  count?: number,
): Promise<QuizFetchResponse> {
  const { data } = await api.get<QuizFetchResponse>(
    ENDPOINTS.quizzes.topicQuiz(examId, topicId),
    { params: count ? { count } : undefined },
  );
  return data;
}

export async function fetchRealPapers(examId: string): Promise<RealPaper[]> {
  const { data } = await api.get<unknown>(ENDPOINTS.quizzes.realPaper(examId));
  return normalizeRealPapers(data);
}

export async function createRealPaper(
  examId: string,
  payload: { title: string; userId?: string },
): Promise<RealPaper> {
  const { data } = await api.post<Envelope<RealPaper>>(
    ENDPOINTS.quizzes.realPaper(examId),
    payload,
  );
  return unwrap<RealPaper>(data);
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