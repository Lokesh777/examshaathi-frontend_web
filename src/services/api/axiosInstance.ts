// The single configured axios instance. Every request/response in the app goes
// through these interceptors, so all API traffic is logged automatically.
import axios from "axios";
import { ENDPOINTS, isAuthCookiePath, isPublicAuthPath } from "./endpoints";
import { ApiError, toApiError } from "./apiError";
import { logApi, maskToken } from "./apiLogger";
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "@/store/tokenStore";
import { refreshSessionAccessToken } from "@/services/auth/sessionRefresh";

import { API_BASE_URL } from "@/lib/env";

export { API_BASE_URL };

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: { "Content-Type": "application/json" },
});

// ---- REQUEST: attach access token + log every outgoing call ----
api.interceptors.request.use((config) => {
  if (isAuthCookiePath(config.url)) {
    config.withCredentials = true;
  }
  const token = getAccessToken();
  const isPublic = isPublicAuthPath(config.url);
  if (token && !isPublic) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  logApi("request", config.method, config.url, {
    url: `${config.baseURL ?? ""}${config.url ?? ""}`,
    auth: isPublic ? "skipped (public auth path)" : maskToken(token),
    hasAuthHeader: Boolean(config.headers?.Authorization),
    params: config.params ?? null,
    body: config.data ?? null,
    withCredentials: config.withCredentials,
  });
  return config;
});

export { extractAccessToken } from "@/services/auth/tokenExtract";
let refreshInFlight: Promise<string | null> | null = null;

/** Rotates the refresh cookie once and returns a fresh access token (or null). */
export function refreshAccessToken(): Promise<string | null> {
  refreshInFlight ??= refreshSessionAccessToken()
    .then((result) => (result.ok ? result.token : null))
    .finally(() => {
      setTimeout(() => {
        refreshInFlight = null;
      }, 0);
    });
  return refreshInFlight;
}

// ---- RESPONSE: log everything, refresh once on 401, reject with ApiError ----
api.interceptors.response.use(
  (response) => {
    logApi("success", response.config.method, response.config.url, {
      status: response.status,
      data: response.data,
      accessTokenInBody: maskToken(
        (response.data as { accessToken?: string } | undefined)?.accessToken,
      ),
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config as (typeof error.config & {
      _retry?: boolean;
    });

    logApi("error", originalRequest?.method, originalRequest?.url, {
      status: error.response?.status ?? "no response (network/CORS)",
      code: error.response?.data?.code,
      message: error.response?.data?.message ?? error.message,
      sentAuthHeader: maskToken(
        typeof originalRequest?.headers?.Authorization === "string"
          ? originalRequest.headers.Authorization.replace("Bearer ", "")
          : null,
      ),
      tokenInStore: maskToken(getAccessToken()),
      raw: error.response?.data,
    });

    const isPublic = isPublicAuthPath(originalRequest?.url);

    if (error.response?.status === 401 && !isPublic) {
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        const result = await refreshSessionAccessToken();
        if (result.ok) {
          originalRequest.headers.Authorization = `Bearer ${result.token}`;
          return api(originalRequest);
        }
        // Only log out when refresh explicitly rejected — not on network blips.
        if (result.reason === "auth") {
          clearAccessToken();
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("auth:unauthorized"));
          }
        }
      } else {
        clearAccessToken();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("auth:unauthorized"));
        }
      }
    }

    return Promise.reject(toApiError(error));
  },
);

export { ApiError };