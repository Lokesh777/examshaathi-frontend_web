// All auth network calls live here — components never call fetch directly.
import { apiRequest, extractAccessToken, rotateRefreshToken } from "@/lib/http-client";
import type { User } from "@/types/api";
import { AUTH_ENDPOINTS } from "@/constants/auth";
import { setAccessToken } from "@/store/tokenStore";

export type BasicResponse = { success: boolean; message?: string };

export type AuthSuccess = {
  success: boolean;
  message?: string;
  data: User;
  accessToken: string;
};

export type LoginResponse =
  | (AuthSuccess & { otpRequired?: false })
  | {
      success: boolean;
      message?: string;
      otpRequired: true;
      tempSessionId: string;
    };

function post<T>(path: string, body?: unknown) {
  return apiRequest<T>(path, {
    method: "POST",
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

/** Stores the access token in memory when the response carries one. */
function captureToken<T>(res: T): T {
  const token = extractAccessToken(res);
  if (token) setAccessToken(token);
  return res;
}

export const authApi = {
  register: (body: { name: string; email: string; password: string }) =>
    post<BasicResponse>(AUTH_ENDPOINTS.register, body),

  login: (body: { email: string; password: string }) =>
    post<LoginResponse>(AUTH_ENDPOINTS.login, body).then((res) =>
      captureToken(res as AuthSuccess),
    ) as Promise<LoginResponse>,

  verifyLoginOtp: (body: { tempSessionId: string; otp: string }) =>
    post<AuthSuccess>(AUTH_ENDPOINTS.verifyLoginOtp, body).then(captureToken),

  /** Returns the session (user + access token) when the backend auto-signs in. */
  verifyEmail: (body: { email: string; otp: string }) =>
    post<BasicResponse & Partial<AuthSuccess>>(
      AUTH_ENDPOINTS.verifyEmail,
      body,
    ).then(captureToken),

  /** Optional endpoint — falls back to forgot-password style resend. */
  resendEmailOtp: (body: { email: string }) =>
    post<BasicResponse>(AUTH_ENDPOINTS.resendEmailOtp, body),

  forgotPassword: (body: { email: string }) =>
    post<BasicResponse>(AUTH_ENDPOINTS.forgotPassword, body),

  resetPassword: (body: { email: string; otp: string; newPassword: string }) =>
    post<BasicResponse>(AUTH_ENDPOINTS.resetPassword, body),

  /**
   * Step-up protected. Called twice:
   *  1. without `otp` -> server sends a step-up OTP (409 / otpRequired)
   *  2. with `otp`    -> password is changed, other sessions invalidated
   */
  changePassword: (body: {
    currentPassword: string;
    newPassword: string;
    otp?: string;
  }) => post<BasicResponse & { otpRequired?: boolean }>(
    AUTH_ENDPOINTS.changePassword,
    body,
  ),

  getMe: () =>
    apiRequest<{ success: boolean; data: User }>(AUTH_ENDPOINTS.getMe),

  logout: () => post<BasicResponse>(AUTH_ENDPOINTS.logout),
  logoutAll: () =>
    apiRequest<BasicResponse>(AUTH_ENDPOINTS.logoutAll, { method: "GET" }),

  refreshToken: () => rotateRefreshToken(),
};