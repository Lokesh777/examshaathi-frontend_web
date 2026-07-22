// Central API client for the ExamSaathi backend.
// - Sends the httpOnly auth cookie with every request (credentials: "include")
// - Any 401 dispatches a global "auth:unauthorized" event handled by AuthProvider

const BASE_URL = "https://examshaathi-backend.onrender.com/api";

export class ApiError extends Error {
  status: number;
  body?: unknown;
  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  let body: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
    throw new ApiError("Unauthorized", 401, body);
  }

  const bodyObj = (body && typeof body === "object" ? body : {}) as {
    success?: boolean;
    message?: string;
    errors?: { field: string; message: string }[];
  };
  if (!res.ok || bodyObj.success === false) {
    const msg = bodyObj.message ?? `Request failed (${res.status})`;
    throw new ApiError(msg, res.status, body);
  }

  return body as T;
}

// ---------- Types ----------

export type User = { id?: string; _id?: string; name: string; email: string };

export interface Exam {
  _id: string;
  name: string;
  slug: string;
  syllabusStatus: "pending" | "fetching" | "ready";
  pattern?: { totalQuestions?: number };
}

export interface Topic {
  _id: string;
  name: string;
  order: number;
  weightage: number | null;
  patternSection: string | null;
}

export interface QuizQuestion {
  _id: string;
  topicId?: string;
  questionText: string;
  options: string[];
  difficulty: "easy" | "moderate" | "hard";
}

export interface QuizFetchResponse {
  success: boolean;
  quizId: string;
  title?: string;
  totalQuestions?: number;
  questions: QuizQuestion[];
  shortfalls?: { topic: string; needed: number; available: number }[];
}

export interface SubmitAnswer {
  questionId: string;
  selectedOption: string | null;
}

export interface AttemptResult {
  questionId: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  referenceLinks: string[];
  selectedOption: string | null;
  isCorrect: boolean;
}

export interface AttemptResponse {
  success: boolean;
  attemptId: string;
  score: number;
  totalQuestions: number;
  scorePercent: number;
  results: AttemptResult[];
  attemptNumber?: number;
  timeTakenSeconds?: number;
  summary?: AttemptSummary;
}

export interface AttemptSummary {
  correctAnswers: number;
  wrongAnswers: number;
  unansweredQuestions: number;
  marksPerCorrect: number;
  negativeMarkPerWrong: number;
  negativeMarksDeducted: number;
  score: number;
  totalMarks: number;
  scorePercent: number;
}

export interface RealPaper {
  _id?: string;
  quizId?: string;
  title: string;
  createdAt?: string;
  totalQuestions?: number;
  attempts?: number;
  attempted?: boolean;
  bestScore?: number;
  bestScorePercent?: number;
  lastScore?: number | null;
  lastScorePercent?: number | null;
  lastAttemptId?: string | null;
  lastAttemptedAt?: string;
}

type RealPaperListEnvelope = {
  data?: unknown;
  papers?: unknown;
  items?: unknown;
  quizzes?: unknown;
  realPapers?: unknown;
  paper?: unknown;
  quiz?: unknown;
};

export interface LeaderboardRow {
  userId: string;
  name: string;
  score: number;
  totalQuestions: number;
  scorePercent: number;
  timeTakenSeconds: number;
}

export interface LeaderboardResponse {
  success: boolean;
  top50: LeaderboardRow[];
  totalParticipants: number;
  myRank: number | null;
  myAttempt: (LeaderboardRow & { userId: string }) | null;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

export interface ChatSendResponse {
  success: boolean;
  answer: string;
  cached: boolean;
  sources: string[];
}

type AuthResponse = { success: boolean; message?: string; data: User };

// ---------- API ----------

export const api = {
  // Auth
  register: (body: { name: string; email: string; password: string }) =>
    request<AuthResponse>("/user/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request<AuthResponse>("/user/login", { method: "POST", body: JSON.stringify(body) }),
  logout: () => request<{ success: boolean }>("/user/logout", { method: "POST" }),

  // Exams / topics
  exams: () => request<{ success: boolean; data: Exam[] } | Exam[]>("/exam"),
  topics: (examId: string) =>
    request<{ success: boolean; data: Topic[] } | Topic[]>(`/exam/${examId}/topics`),

  // Quiz
  topicQuiz: (examId: string, topicId: string, count?: number) =>
    request<QuizFetchResponse>(
      `/quiz/exams/${examId}/topics/${topicId}/quiz${count ? `?count=${count}` : ""}`,
    ),
  realPaper: (examId: string) =>
    request<QuizFetchResponse>(`/quiz/exams/${examId}/real-paper`),
  listRealPapers: async (examId: string) => {
    const res = await request<unknown>(`/quiz/exams/${examId}/real-paper`);
    return normalizeRealPapers(res);
  },
  createRealPaper: async (
    examId: string,
    body: { title: string; userId?: string },
  ) => {
    const res = await request<
      { success: boolean; data: RealPaper } | RealPaper
    >(`/quiz/exams/${examId}/real-paper`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return unwrap<RealPaper>(res as { data: RealPaper } | RealPaper);
  },
  getQuiz: (quizId: string) =>
    request<QuizFetchResponse>(`/quiz/quizzes/${quizId}`),
  renameQuiz: (quizId: string, title: string) =>
    request<{ success: boolean; data?: RealPaper }>(
      `/quiz/quizzes/${quizId}`,
      { method: "PATCH", body: JSON.stringify({ title }) },
    ),
  submitAttempt: (
    quizId: string,
    body: { answers: SubmitAnswer[]; timeTakenSeconds: number },
  ) =>
    request<AttemptResponse>(`/quiz/quizzes/${quizId}/attempt`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then(normalizeAttemptResponse),
  leaderboard: (quizId: string) =>
    request<LeaderboardResponse>(`/quiz/quizzes/${quizId}/leaderboard`),

  // Chat
  chatHistory: (examId: string, topicId: string) =>
    request<{ success: boolean; history: ChatMessage[] }>(
      `/chat/exams/${examId}/topics/${topicId}/chat`,
    ),
  chatSend: (examId: string, topicId: string, message: string) =>
    request<ChatSendResponse>(`/chat/exams/${examId}/topics/${topicId}/chat`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),
};

// Helper to unwrap either `{ success, data }` or a bare array response.
export function unwrap<T>(res: { data: T } | T): T {
  if (res && typeof res === "object" && "data" in (res as Record<string, unknown>)) {
    return (res as { data: T }).data;
  }
  return res as T;
}

export function normalizeRealPapers(value: unknown): RealPaper[] {
  return _normalizeRealPapers(value);
}

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

function _normalizeRealPapers(value: unknown): RealPaper[] {
  if (Array.isArray(value)) return value.filter(isRealPaperLike) as RealPaper[];

  if (!value || typeof value !== "object") return [];

  const obj = value as RealPaperListEnvelope;
  const candidates = [
    obj.data,
    obj.papers,
    obj.items,
    obj.quizzes,
    obj.realPapers,
  ];

  for (const candidate of candidates) {
    const papers = normalizeRealPapers(candidate);
    if (papers.length > 0) return papers;
  }

  if (isRealPaperLike(value)) return [value as RealPaper];
  if (isRealPaperLike(obj.paper)) return [obj.paper as RealPaper];
  if (isRealPaperLike(obj.quiz)) return [obj.quiz as RealPaper];

  return [];
}

function isRealPaperLike(value: unknown): value is Partial<RealPaper> {
  return Boolean(
    value &&
      typeof value === "object" &&
      (typeof (value as { _id?: unknown })._id === "string" ||
        typeof (value as { quizId?: unknown }).quizId === "string"),
  );
}