// Domain types shared across the app. Mirrors the ExamSaathi backend contract.

export type User = {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  verified?: boolean;
  role?: string;
  selectedExamId?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

/** Backend returns `_id`; older shapes used `id`. Use this everywhere. */
export const userId = (user?: User | null): string | undefined =>
  user?._id ?? user?.id;

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
  myAttempt: LeaderboardRow | null;
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

/** Backends return either `{ success, data }` or the payload directly. */
export type Envelope<T> = { success: boolean; data: T } | T;
