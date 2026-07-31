// Access token is kept in memory AND mirrored to localStorage so it survives
// reloads / the 401 redirect (the refresh cookie is blocked in the preview
// iframe, so memory-only loses the session on every navigation).
const STORAGE_KEY = "examsaathi.accessToken";

function readStored(): string | null {
  try {
    return typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
  } catch {
    return null;
  }
}

let accessToken: string | null = readStored();

type AccessTokenListener = (token: string | null) => void;
const listeners = new Set<AccessTokenListener>();

/** Lets React state mirror silent refreshes performed by the axios interceptor. */
export function subscribeAccessToken(listener: AccessTokenListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAccessToken(): string | null {
  if (!accessToken) accessToken = readStored();
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
  console.log(
    `%c[TOKEN] ${token ? "stored" : "cleared"}`,
    "color:#a855f7;font-weight:bold",
    token ? `${token.slice(0, 16)}…${token.slice(-6)}` : null,
  );
  try {
    if (typeof localStorage !== "undefined") {
      if (token) localStorage.setItem(STORAGE_KEY, token);
      else localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    /* ignore */
  }
  listeners.forEach((listener) => listener(token));
}

export function clearAccessToken(): void {
  setAccessToken(null);
}
