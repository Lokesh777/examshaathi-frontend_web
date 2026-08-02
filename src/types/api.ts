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

export interface QuestionMediaItem {
  type?: "image";
  url: string;
  alt?: string;
}

export interface OptionMediaItem {
  letter: "A" | "B" | "C" | "D";
  url: string;
  alt?: string;
}

export interface QuizQuestion {
  _id: string;
  topicId?: string;
  questionText: string;
  options: string[];
  difficulty: "easy" | "moderate" | "hard";
  questionMedia?: QuestionMediaItem | null;
  optionMedia?: OptionMediaItem[];
  answerMode?: "text" | "letter";
}

export interface QuizFetchResponse {
  success: boolean;
  quizId: string;
  title?: string;
  totalQuestions?: number;
  durationMinutes?: number | null;
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
  questionMedia?: QuestionMediaItem | null;
  optionMedia?: OptionMediaItem[];
  answerMode?: "text" | "letter";
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

export interface ProviderAttempt {
  provider: string;
  model: string;
  stage: string;
  success: boolean;
  error?: string | null;
  questionCount?: number;
  at: string;
}

export interface OfficialPaper {
  catalogId?: string;
  quizId: string | null;
  title: string;
  year: number;
  setCode?: string;
  status?: "pending" | "linked" | "extracting" | "extracted" | "published" | "failed";
  currentStage?: string | null;
  extractionMethod?: string | null;
  extractionLabel?: string | null;
  extractionModel?: string | null;
  activeProvider?: string | null;
  activeModel?: string | null;
  questionPdfUrl?: string;
  answerKeyPdfUrl?: string | null;
  totalQuestions?: number;
  durationMinutes?: number;
  publishedAt?: string;
  attempted?: boolean;
  lastScore?: number | null;
  lastScorePercent?: number | null;
  lastAttemptId?: string | null;
  errorMessage?: string | null;
  stageLogs?: SyncStageLog[];
  providerAttempts?: ProviderAttempt[];
  paperData?: Record<string, unknown> | null;
  stats?: {
    extracted?: number;
    matched?: number;
    inserted?: number;
    skipped?: number;
    missingCount?: number;
    expectedQuestionCount?: number;
  };
  pageProgress?: PageProgress | null;
}

export interface SyncStageLog {
  stage: string;
  message: string;
  level: "info" | "warn" | "error";
  provider?: string | null;
  at: string;
}

export interface AiProviderCapability {
  id: string;
  label: string;
  model: string;
  available: boolean;
  reason?: string | null;
}

export interface AiCapabilities {
  providerOrder: string[];
  providers: AiProviderCapability[];
  popplerConfigured: boolean;
}

export interface PageProgress {
  current: number;
  total: number;
  phase?: string | null;
  questionsFound?: number;
  updatedAt?: string;
}

export interface SyncJobLivePaper {
  catalogId: string;
  title: string;
  status?: string;
  currentStage?: string | null;
  pageProgress?: PageProgress | null;
  stats?: OfficialPaper["stats"];
  stageLogs?: SyncStageLog[];
}

export interface SyncJobStatus {
  _id: string;
  status: "running" | "completed" | "failed";
  phase?: "fetch_links" | "extract" | "full";
  currentStage?: string | null;
  activeProvider?: string | null;
  activeModel?: string | null;
  preferredProvider?: string | null;
  pageProgress?: PageProgress | null;
  livePaper?: SyncJobLivePaper | null;
  progress: {
    total: number;
    completed: number;
    published: number;
    failed: number;
  };
  currentPaper?: string | null;
  stageLogs?: SyncStageLog[];
  errors?: string[];
  startedAt?: string;
  finishedAt?: string | null;
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
