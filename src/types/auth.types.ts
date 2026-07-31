// Request/response shapes for every auth endpoint.
import type { User } from "./api";

export type { User };

export type BasicResponse = { success: boolean; message?: string };

export type AuthSession = BasicResponse & {
  data: User;
  accessToken: string;
};

export type RegisterRequest = { name: string; email: string; password: string };
export type RegisterResponse = BasicResponse;

export type LoginRequest = { email: string; password: string };
export type LoginResponse = AuthSession;

export type VerifyEmailRequest = { email: string; otp: string };
/** Backend auto-signs the user in on success, so a token usually comes back. */
export type VerifyEmailResponse = BasicResponse & Partial<AuthSession>;

export type ForgotPasswordRequest = { email: string };
export type ResetPasswordRequest = {
  email: string;
  otp: string;
  newPassword: string;
};
/** Backend now signs the user in on reset, returning data + accessToken. */
export type ResetPasswordResponse = BasicResponse & Partial<AuthSession>;
/** POST /user/update-password — logged-in user, no OTP. */
export type ChangePasswordRequest = {
  password: string;
  newPassword: string;
};
export type ChangePasswordResponse = BasicResponse;

export type CurrentUserResponse = { success: boolean; data: User };