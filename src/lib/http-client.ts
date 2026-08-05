// Low-level HTTP client for the ExamSaathi backend.
// - Attaches the in-memory access token as `Authorization: Bearer …`
//   (never on the public auth endpoints, where a stale token is rejected)
// - Sends the refresh cookie only on login / refresh / logout routes
// - On 401 it rotates the refresh token once, retries, then gives up and
//   dispatches "auth:unauthorized" for AuthProvider to handle
import { AUTH_ENDPOINTS } from "@/constants/auth";
import { isAuthCookiePath } from "@/services/api/endpoints";
import { getAccessToken, setAccessToken } from "@/store/tokenStore";
import { refreshSessionAccessToken } from "@/services/auth/sessionRefresh";
import { extractAccessToken } from "@/services/auth/tokenExtract";
import { API_BASE_URL } from "@/lib/env";

export { API_BASE_URL };

/** Endpoints that are public: no bearer, and never refresh-and-retry. */
const PUBLIC_PATHS: readonly string[] = [
  AUTH_ENDPOINTS.login,
  AUTH_ENDPOINTS.register,
  AUTH_ENDPOINTS.refreshToken,
  AUTH_ENDPOINTS.verifyLoginOtp,
  AUTH_ENDPOINTS.verifyEmail,
  AUTH_ENDPOINTS.resendEmailOtp,
  AUTH_ENDPOINTS.forgotPassword,
  AUTH_ENDPOINTS.resetPassword,
];

const isPublicPath = (path: string) =>
  PUBLIC_PATHS.some((p) => path === p || path.startsWith(`${p}?`));

export class ApiError extends Error {
  readonly status: number;
  readonly body?: unknown;
  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

/** Pulls an access token out of the shapes the backend uses. */
export { extractAccessToken } from "@/services/auth/tokenExtract";

/** Rotates the refresh cookie and returns a fresh access token (or null). */
export async function rotateRefreshToken(): Promise<string | null> {
  const result = await refreshSessionAccessToken();
  return result.ok ? result.token : null;
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  opts: { retried?: boolean } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };

  const token = getAccessToken();
  if (token && !isPublicPath(path)) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
      credentials: isAuthCookiePath(path) ? "include" : "omit",
    });
  } catch {
    // No HTTP response at all — offline, backend asleep, or blocked by CORS.
    throw new ApiError(
      "Network error: could not reach the server.",
      0,
      null,
    );
  }

  const body = await parseBody(res);

  if (res.status === 401) {
    if (!opts.retried && !isPublicPath(path)) {
      const result = await refreshSessionAccessToken();
      if (result.ok) return apiRequest<T>(path, init, { retried: true });
      if (result.reason === "auth") {
        setAccessToken(null);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("auth:unauthorized"));
        }
      }
    } else if (!isPublicPath(path)) {
      setAccessToken(null);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
    }
    throw new ApiError("Unauthorized", 401, body);
  }

  const envelope = (body && typeof body === "object" ? body : {}) as {
    success?: boolean;
    message?: string;
  };
  if (!res.ok || envelope.success === false) {
    throw new ApiError(
      envelope.message ?? `Request failed (${res.status})`,
      res.status,
      body,
    );
  }

  return body as T;
}
