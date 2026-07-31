// Single source of truth for auth endpoints, routes and OTP policy.
export const AUTH_ENDPOINTS = {
  register: "/user/register",
  login: "/user/login",
  verifyLoginOtp: "/user/verify-login-otp",
  verifyEmail: "/user/verify-email",
  resendEmailOtp: "/user/resend-otp",
  forgotPassword: "/user/forgot-password",
  resetPassword: "/user/reset-password",
  changePassword: "/user/change-password",
  logout: "/user/logout",
  logoutAll: "/user/logout-all",
  getMe: "/user/get-me",
  refreshToken: "/user/refresh-token",
} as const;

export const AUTH_ROUTES = {
  login: "/auth",
  register: "/auth/register",
  verifyEmail: "/auth/verify-email",
  loginOtp: "/auth/login-otp",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
  changePassword: "/change-password",
} as const;

export const OTP_LENGTH = 6;
/** Server-side OTP validity, mirrored here only for copy in the UI. */
export const OTP_EXPIRY_MINUTES = 10;
/** Cooldown before the user may request another OTP. */
export const OTP_RESEND_SECONDS = 60;
export const MIN_PASSWORD_LENGTH = 8;