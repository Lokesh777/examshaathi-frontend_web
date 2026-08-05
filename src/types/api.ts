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
  pattern?: {
    totalQuestions?: number;
    totalMarks?: number;
    marksPerQuestion?: number;
    durationMinutes?: number;
    passingMarksPercent?: number;
    examMode?: string;
    negativeMarkingFraction?: number;
    officialSyllabusUrl?: string;
    sourceLinks?: string[];
    sections?: { topicName: string; questionCount: number; marks: number }[];
  };
  questionProfile?: {
    optionCount?: number;
    markingScheme?: {
      correct?: number;
      incorrect?: number;
      unanswered?: number;
      disqualifyBlankPercent?: number | null;
    };
  };
}

export interface Topic {
  _id: string;
  name: string;
  order: number;
  weightage: number | null;
  patternSection: string | null;
  questionCount?: number;
  quizzesSolved?: number;
  readinessTarget?: number;
  readinessPercent?: number;
  showProgress?: boolean;
}

export type BankShortfall = {
  topicId?: string;
  topic: string;
  needed: number;
  available: number;
  deficit?: number;
};

export interface QuestionMediaItem {
  type?: "image";
  url: string;
  alt?: string;
}

export interface OptionMediaItem {
  letter: "A" | "B" | "C" | "D" | "E";
  url: string;
  alt?: string;
}

export type QuestionType =
  | "direct"
  | "statement"
  | "matching"
  | "assertion_reason"
  | "chronology"
  | "applied_pedagogy";

export interface QuizQuestion {
  _id: string;
  topicId?: string;
  questionText: string;
  options: string[];
  difficulty: "easy" | "moderate" | "hard";
  questionType?: QuestionType;
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
  shortfalls?: BankShortfall[];
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
  notAttemptedCount?: number;
  blankPercent?: string;
  marksPerCorrect: number;
  negativeMarkPerWrong: number;
  negativeMarkPerUnanswered?: number;
  negativeMarksDeducted: number;
  disqualificationWarning?: string | null;
  score: number;
  totalMarks: number;
  scorePercent: number;
  passingMarksPercent?: number | null;
  passed?: boolean | null;
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
  createdBy?: string | null;
  isOwner?: boolean;
  canDelete?: boolean;
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

export interface BankQuestionSummary {
  _id: string;
  questionText: string;
  questionType?: string;
  source?: string;
  pattern?: string;
  difficulty?: string;
  createdBy?: string | null;
  createdAt?: string;
  isOwner?: boolean;
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
  importSource?: "admin-import";
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

export type ImportMode =
  | "official-paper"
  | "real-paper"
  | "topic-wise"
  | "bank-manual"
  | "bank-ai";

export interface AdminExamProfile {
  examName: string;
  examSlug: string;
  optionCount: number;
  fifthOptionText: string;
  defaultPattern: string;
  enabledQuestionTypes: QuestionType[];
  typeMix: Record<string, number>;
  markingScheme: {
    correct: number;
    incorrect: number;
    unanswered: number;
    disqualifyBlankPercent: number | null;
  };
  questionTypes: { id: QuestionType; label: string; labelHi: string }[];
}

export interface ImportPreviewRow {
  index: number;
  questionText: string;
  questionType: string;
  optionCount: number;
  valid: boolean;
  errors: string[];
}

export type CatalogLinkMode = "auto" | "existing" | "new";

export interface OfficialPaperCatalogItem {
  catalogId: string;
  title: string;
  year: number;
  setCode?: string;
  status: string;
  quizId: string | null;
  questionPdfUrl?: string;
  answerKeyPdfUrl?: string;
  publishedAt?: string;
}

export interface CatalogMatchPreview {
  catalogId: string;
  title: string;
  year: number;
  setCode?: string;
  status: string;
  hasQuiz: boolean;
}

export interface ImportValidateResponse {
  preview: ImportPreviewRow[];
  validCount: number;
  totalCount: number;
  aiNormalized: boolean;
  topicsAutoAssigned?: boolean;
  catalogMatch?: CatalogMatchPreview | null;
  detectedFormat?: "cet-paper-export" | "standard";
  profile: { optionCount: number; defaultPattern: string };
  normalized: unknown[];
}

export interface ImportResult {
  inserted: number;
  skipped: number;
  quizId: string | null;
  catalogId?: string | null;
  catalogCreated?: boolean;
  questionIds: string[];
}

export interface GenerateResult {
  inserted: number;
  preview: { _id: string; questionType: string; questionText: string; options: string[] }[];
  profile: { optionCount: number; defaultPattern?: string };
}

export type ContactCategory =
  | "feedback"
  | "bug"
  | "feature_request"
  | "career"
  | "investor"
  | "partnership"
  | "general";

export type ContactSource = "contact" | "feedback";

export interface ContactSubmitResult {
  id: string;
  sheetSynced: boolean;
  screenshotUrl?: string | null;
  screenshotSkipped?: boolean;
  message: string;
}

export interface ContactSubmission {
  _id: string;
  name: string;
  email: string;
  category: ContactCategory;
  subject: string;
  message: string;
  screenshotUrl?: string | null;
  source: ContactSource;
  sheetSynced: boolean;
  sheetError?: string | null;
  createdAt: string;
}

export interface FeedbackListResponse {
  items: ContactSubmission[];
  total: number;
  page: number;
  limit: number;
  spreadsheetUrl: string;
  imageKitReady?: boolean;
}
