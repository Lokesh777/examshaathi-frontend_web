// Access token lives in memory only (never localStorage — XSS-safe).
// After reload or expiry, POST /user/refresh-token uses the HttpOnly refresh cookie.
let accessToken: string | null = null;

type AccessTokenListener = (token: string | null) => void;
const listeners = new Set<AccessTokenListener>();

/** Lets React state mirror silent refreshes performed by the axios interceptor. */
export function subscribeAccessToken(listener: AccessTokenListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
  listeners.forEach((listener) => listener(token));
}

export function clearAccessToken(): void {
  setAccessToken(null);
}

/** Removes legacy token persisted before the memory-only migration. */
export function purgeLegacyStoredAccessToken(): void {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("examsaathi.accessToken");
    }
  } catch {
    /* ignore */
  }
}
