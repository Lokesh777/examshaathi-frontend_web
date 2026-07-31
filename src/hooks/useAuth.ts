// The one place components touch auth: session state + every auth action.
// Components never import authService or axios directly.
import { useMemo } from "react";
import { useAuthContext } from "@/store/authStore";
import * as authService from "@/services/auth/authService";
import type {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from "@/types/auth.types";

export function useAuth() {
  const { setSession, clearSession, clearAllSessions, ...state } = useAuthContext();

  const actions = useMemo(
    () => ({
      /** POST /user/login — stores the session on success. */
      login: async (payload: LoginRequest) => {
        const res = await authService.loginUser(payload);
        if (res?.data) setSession(res.data, res.accessToken);
        return res;
      },
      /** POST /user/register — no token; backend emails an OTP. */
      register: (payload: RegisterRequest) => authService.registerUser(payload),
      /** POST /user/verify-email — signs the user in when a token is returned. */
      verifyEmailOtp: async (payload: VerifyEmailRequest) => {
        const res = await authService.verifyEmailOtp(payload);
        if (res?.accessToken && res.data) setSession(res.data, res.accessToken);
        return res;
      },
      resendEmailOtp: (payload: ForgotPasswordRequest) =>
        authService.resendEmailVerificationOtp(payload),
      requestPasswordReset: (payload: ForgotPasswordRequest) =>
        authService.requestPasswordReset(payload),
      /** POST /user/reset-password — signs the user in when a token is returned. */
      resetPassword: async (payload: ResetPasswordRequest) => {
        const res = await authService.resetPasswordWithOtp(payload);
        if (res?.accessToken && res.data) setSession(res.data, res.accessToken);
        return res;
      },
      changePassword: (payload: ChangePasswordRequest) =>
        authService.changePassword(payload),
      fetchCurrentUser: () => authService.fetchCurrentUser(),
      logout: clearSession,
      logoutAllDevices: clearAllSessions,
    }),
    [setSession, clearSession, clearAllSessions],
  );

  return { ...state, setSession, clearSession, clearAllSessions, ...actions };
}