// Auth routes and OTP policy. API paths live in src/services/api/endpoints.ts.
import { ENDPOINTS } from "@/services/api/endpoints";

export const AUTH_ROUTES = {
  login: "/auth",
  register: "/auth/register",
  verifyEmail: "/auth/verify-email",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
  changePassword: "/change-password",
} as const;

/** Legacy alias used by src/api/authApi.ts and src/lib/http-client.ts */
export const AUTH_ENDPOINTS = {
  register: ENDPOINTS.auth.register,
  login: ENDPOINTS.auth.login,
  verifyLoginOtp: "/user/verify-login-otp",
  verifyEmail: ENDPOINTS.auth.verifyEmail,
  resendEmailOtp: ENDPOINTS.auth.resendEmailOtp,
  forgotPassword: ENDPOINTS.auth.forgotPassword,
  resetPassword: ENDPOINTS.auth.resetPassword,
  changePassword: ENDPOINTS.auth.updatePassword,
  refreshToken: ENDPOINTS.auth.refreshToken,
  getMe: ENDPOINTS.auth.me,
  logout: ENDPOINTS.auth.logout,
  logoutAll: ENDPOINTS.auth.logoutAll,
} as const;

export const OTP_LENGTH = 6;
/** Server-side OTP validity, mirrored here only for copy in the UI. */
export const OTP_EXPIRY_MINUTES = 10;
/** Cooldown before the user may request another OTP. */
export const OTP_RESEND_SECONDS = 60;
export const MIN_PASSWORD_LENGTH = 8;