// Every backend URL path lives here — grouped by feature. No hardcoded URL
// strings anywhere else in the app.
export const ENDPOINTS = {
  auth: {
    register: "/user/register",
    login: "/user/login",
    verifyEmail: "/user/verify-email",
    resendEmailOtp: "/user/resend-otp",
    forgotPassword: "/user/forgot-password",
    resetPassword: "/user/reset-password",
    updatePassword: "/user/update-password",
    refreshToken: "/user/refresh-token",
    me: "/user/me",
    logout: "/user/logout",
    logoutAll: "/user/logout-all",
  },
  exams: {
    list: "/exam",
    topics: (examId: string) => `/exam/${examId}/topics`,
  },
  quizzes: {
    topicQuiz: (examId: string, topicId: string) =>
      `/quiz/exams/${examId}/topics/${topicId}/quiz`,
    realPaper: (examId: string) => `/quiz/exams/${examId}/real-paper`,
    quizById: (quizId: string) => `/quiz/quizzes/${quizId}`,
    attempt: (quizId: string) => `/quiz/quizzes/${quizId}/attempt`,
    leaderboard: (quizId: string) => `/quiz/quizzes/${quizId}/leaderboard`,
  },
  chat: {
    topicChat: (examId: string, topicId: string) =>
      `/chat/exams/${examId}/topics/${topicId}/chat`,
  },
  officialPapers: {
    list: (examId: string) => `/official-papers/exams/${examId}`,
    sync: (examId: string) => `/official-papers/admin/exams/${examId}/sync`,
    syncLinks: (examId: string) => `/official-papers/admin/exams/${examId}/sync/links`,
    syncExtract: (examId: string) => `/official-papers/admin/exams/${examId}/sync/extract`,
    syncCapabilities: (examId: string) => `/official-papers/admin/exams/${examId}/sync/capabilities`,
    syncStatus: (jobId: string) => `/official-papers/admin/sync/${jobId}`,
    extractImageQuestions: (catalogId: string) =>
      `/official-papers/admin/catalog/${catalogId}/extract-image-questions`,
    catalogQuestionMedia: (catalogId: string) =>
      `/official-papers/admin/catalog/${catalogId}/question-media`,
  },
} as const;

/** Public auth paths: never send a bearer, never refresh-and-retry on 401. */
export const PUBLIC_AUTH_PATHS: readonly string[] = [
  ENDPOINTS.auth.login,
  ENDPOINTS.auth.register,
  ENDPOINTS.auth.verifyEmail,
  ENDPOINTS.auth.resendEmailOtp,
  ENDPOINTS.auth.forgotPassword,
  ENDPOINTS.auth.resetPassword,
  ENDPOINTS.auth.refreshToken,
];

export const isPublicAuthPath = (url?: string) =>
  Boolean(url) && PUBLIC_AUTH_PATHS.some((p) => url === p || url!.startsWith(`${p}?`));

/**
 * Auth routes that need the HttpOnly refresh cookie (set, rotate, or clear).
 * All other API calls use only the in-memory Bearer token — no cookie sent.
 */
export const AUTH_COOKIE_PATHS: readonly string[] = [
  ENDPOINTS.auth.login,
  ENDPOINTS.auth.verifyEmail,
  ENDPOINTS.auth.resetPassword,
  ENDPOINTS.auth.refreshToken,
  ENDPOINTS.auth.logout,
  ENDPOINTS.auth.logoutAll,
  "/user/verify-login-otp",
];

export const isAuthCookiePath = (url?: string) =>
  Boolean(url) &&
  AUTH_COOKIE_PATHS.some((p) => url === p || url!.startsWith(`${p}?`));