// Every auth API call. Components never call axios directly — they go through
// useAuth(), which calls these functions.
import { api } from "@/services/api/axiosInstance";
import { ENDPOINTS } from "@/services/api/endpoints";
import { setAccessToken } from "@/store/tokenStore";
import { refreshAccessToken } from "@/services/api/axiosInstance";
import type {
  BasicResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  CurrentUserResponse,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
} from "@/types/auth.types";

/** Registers a new user. Backend emails a verification OTP — no token here. */
export async function registerUser(payload: RegisterRequest): Promise<RegisterResponse> {
  const { data } = await api.post<RegisterResponse>(ENDPOINTS.auth.register, payload);
  return data;
}

/**
 * Logs in an existing, verified user and stores the access token in memory.
 * On 403 with code "EMAIL_NOT_VERIFIED" the caller must redirect to the OTP
 * screen — the backend has already re-sent a fresh code.
 */
export async function loginUser(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>(ENDPOINTS.auth.login, payload);
  console.log(data, "items------------data", data.accessToken);
  if (data.accessToken) setAccessToken(data.accessToken);
  return data;
}

/** Verifies the register-time (or unverified-login) OTP and signs the user in. */
export async function verifyEmailOtp(payload: VerifyEmailRequest): Promise<VerifyEmailResponse> {
  const { data } = await api.post<VerifyEmailResponse>(ENDPOINTS.auth.verifyEmail, payload);
  if (data.accessToken) setAccessToken(data.accessToken);
  return data;
}

/** Re-sends the email verification OTP. */
export async function resendEmailVerificationOtp(payload: ForgotPasswordRequest): Promise<BasicResponse> {
  const { data } = await api.post<BasicResponse>(ENDPOINTS.auth.resendEmailOtp, payload);
  return data;
}

/** Starts the forgot-password flow: backend emails a reset OTP. */
export async function requestPasswordReset(payload: ForgotPasswordRequest): Promise<BasicResponse> {
  const { data } = await api.post<BasicResponse>(ENDPOINTS.auth.forgotPassword, payload);
  return data;
}

/** Completes the forgot-password flow with the emailed OTP and signs the user in. */
export async function resetPasswordWithOtp(payload: ResetPasswordRequest): Promise<ResetPasswordResponse> {
  const { data } = await api.post<ResetPasswordResponse>(ENDPOINTS.auth.resetPassword, payload);
  if (data.accessToken) setAccessToken(data.accessToken);
  return data;
}

/** POST /user/update-password — logged-in user swaps old password for a new one. */
export async function changePassword(payload: ChangePasswordRequest): Promise<ChangePasswordResponse> {
  const { data } = await api.post<ChangePasswordResponse>(ENDPOINTS.auth.updatePassword, payload);
  return data;
}

/** Loads the signed-in user's profile. */
export async function fetchCurrentUser(): Promise<CurrentUserResponse> {
  const { data } = await api.get<CurrentUserResponse>(ENDPOINTS.auth.me);
  return data;
}

export async function logoutUser(): Promise<BasicResponse> {
  const { data } = await api.post<BasicResponse>(ENDPOINTS.auth.logout);
  return data;
}

export async function logoutUserFromAllDevices(): Promise<BasicResponse> {
  const { data } = await api.post<BasicResponse>(ENDPOINTS.auth.logoutAll);
  return data;
}

/** Rotates the httpOnly refresh cookie into a fresh access token. */
export function refreshSessionToken(): Promise<string | null> {
  return refreshAccessToken();
}
