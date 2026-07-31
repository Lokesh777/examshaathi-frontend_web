// Public API surface for the app. Auth calls live in src/api/authApi.ts.
import { apiRequest } from "./http-client";
import { normalizeAttemptResponse, normalizeRealPapers, unwrap } from "./normalizers";
import type {
  AttemptResponse,
  ChatMessage,
  ChatSendResponse,
  Envelope,
  Exam,
  LeaderboardResponse,
  QuizFetchResponse,
  RealPaper,
  SubmitAnswer,
  Topic,
} from "@/types/api";

export * from "@/types/api";
export { ApiError, API_BASE_URL, apiRequest, rotateRefreshToken, extractAccessToken } from "./http-client";
export { normalizeAttemptResponse, normalizeRealPapers, unwrap } from "./normalizers";

const json = (body: unknown) => JSON.stringify(body);

export const api = {
  // Exams / topics
  exams: () => apiRequest<Envelope<Exam[]>>("/exam"),
  topics: (examId: string) =>
    apiRequest<Envelope<Topic[]>>(`/exam/${examId}/topics`),

  // Quiz
  topicQuiz: (examId: string, topicId: string, count?: number) =>
    apiRequest<QuizFetchResponse>(
      `/quiz/exams/${examId}/topics/${topicId}/quiz${count ? `?count=${count}` : ""}`,
    ),
  realPaper: (examId: string) =>
    apiRequest<QuizFetchResponse>(`/quiz/exams/${examId}/real-paper`),
  listRealPapers: async (examId: string) =>
    normalizeRealPapers(await apiRequest<unknown>(`/quiz/exams/${examId}/real-paper`)),
  createRealPaper: async (examId: string, body: { title: string; userId?: string }) =>
    unwrap<RealPaper>(
      await apiRequest<Envelope<RealPaper>>(`/quiz/exams/${examId}/real-paper`, {
        method: "POST",
        body: json(body),
      }),
    ),
  getQuiz: (quizId: string) => apiRequest<QuizFetchResponse>(`/quiz/quizzes/${quizId}`),
  renameQuiz: (quizId: string, title: string) =>
    apiRequest<{ success: boolean; data?: RealPaper }>(`/quiz/quizzes/${quizId}`, {
      method: "PATCH",
      body: json({ title }),
    }),
  submitAttempt: (
    quizId: string,
    body: { answers: SubmitAnswer[]; timeTakenSeconds: number },
  ) =>
    apiRequest<AttemptResponse>(`/quiz/quizzes/${quizId}/attempt`, {
      method: "POST",
      body: json(body),
    }).then(normalizeAttemptResponse),
  leaderboard: (quizId: string) =>
    apiRequest<LeaderboardResponse>(`/quiz/quizzes/${quizId}/leaderboard`),

  // Chat
  chatHistory: (examId: string, topicId: string) =>
    apiRequest<{ success: boolean; history: ChatMessage[] }>(
      `/chat/exams/${examId}/topics/${topicId}/chat`,
    ),
  chatSend: (examId: string, topicId: string, message: string) =>
    apiRequest<ChatSendResponse>(`/chat/exams/${examId}/topics/${topicId}/chat`, {
      method: "POST",
      body: json({ message }),
    }),
};
