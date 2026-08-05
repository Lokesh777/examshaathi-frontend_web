/**
 * Coordinated refresh-token rotation across tabs.
 * - One in-flight refresh per tab
 * - Cross-tab lock so two tabs don't rotate the cookie at once
 * - BroadcastChannel shares the new access token with other tabs
 * - Network failures do NOT count as logout (only explicit 401 from refresh)
 */
import axios from "axios";
import { ENDPOINTS } from "@/services/api/endpoints";
import { API_BASE_URL } from "@/lib/env";
import { extractAccessToken } from "@/services/auth/tokenExtract";
import { getAccessToken, setAccessToken } from "@/store/tokenStore";

export type RefreshResult =
  | { ok: true; token: string }
  | { ok: false; reason: "auth" | "network" | "no_token" };

const LOCK_KEY = "examsaathi.refreshLock";
const LOCK_TTL_MS = 20_000;
const CHANNEL_NAME = "examsaathi-auth";

let refreshInFlight: Promise<RefreshResult> | null = null;

function getAuthChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === "undefined") return null;
  return new BroadcastChannel(CHANNEL_NAME);
}

function broadcastAccessToken(token: string) {
  try {
    getAuthChannel()?.postMessage({ type: "access-token", token });
  } catch {
    /* ignore */
  }
}

/** Listen in AuthProvider so other tabs pick up silent refreshes. */
export function subscribeCrossTabAccessToken(
  listener: (token: string) => void,
): () => void {
  const channel = getAuthChannel();
  if (!channel) return () => undefined;

  const onMessage = (event: MessageEvent) => {
    const data = event.data as { type?: string; token?: string };
    if (data?.type === "access-token" && typeof data.token === "string") {
      setAccessToken(data.token);
      listener(data.token);
    }
  };

  channel.addEventListener("message", onMessage);
  return () => channel.removeEventListener("message", onMessage);
}

function readLock(): number | null {
  try {
    const raw = localStorage.getItem(LOCK_KEY);
    if (!raw) return null;
    const ts = Number(raw);
    return Number.isFinite(ts) ? ts : null;
  } catch {
    return null;
  }
}

function acquireLock(): boolean {
  const now = Date.now();
  const existing = readLock();
  if (existing != null && now - existing < LOCK_TTL_MS) return false;
  try {
    localStorage.setItem(LOCK_KEY, String(now));
    return true;
  } catch {
    return true;
  }
}

function releaseLock() {
  try {
    localStorage.removeItem(LOCK_KEY);
  } catch {
    /* ignore */
  }
}

function waitForCrossTabRefresh(timeoutMs = 12_000): Promise<RefreshResult> {
  return new Promise((resolve) => {
    const channel = getAuthChannel();
    let done = false;

    const finish = (result: RefreshResult) => {
      if (done) return;
      done = true;
      window.clearTimeout(timer);
      channel?.removeEventListener("message", onMessage);
      resolve(result);
    };

    const onMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; token?: string };
      if (data?.type === "access-token" && typeof data.token === "string") {
        setAccessToken(data.token);
        finish({ ok: true, token: data.token });
      }
    };

    channel?.addEventListener("message", onMessage);

    const timer = window.setTimeout(() => {
      const token = getAccessToken();
      if (token) finish({ ok: true, token });
      else finish({ ok: false, reason: "network" });
    }, timeoutMs);

    // Poll in case token was set without channel (same tab)
    const poll = window.setInterval(() => {
      const token = getAccessToken();
      if (token) {
        window.clearInterval(poll);
        finish({ ok: true, token });
      }
    }, 250);

    window.setTimeout(() => window.clearInterval(poll), timeoutMs);
  });
}

async function postRefresh(): Promise<RefreshResult> {
  try {
    const res = await axios.post(
      `${API_BASE_URL}${ENDPOINTS.auth.refreshToken}`,
      null,
      { withCredentials: true, timeout: 25_000 },
    );
    const token = extractAccessToken(res.data);
    if (!token) return { ok: false, reason: "auth" };
    setAccessToken(token);
    broadcastAccessToken(token);
    return { ok: true, token };
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (!err.response) return { ok: false, reason: "network" };
      if (err.response.status === 401 || err.response.status === 403) {
        return { ok: false, reason: "auth" };
      }
      return { ok: false, reason: "network" };
    }
    return { ok: false, reason: "network" };
  }
}

/** Refresh session; safe to call from interceptors and on tab focus. */
export async function refreshSessionAccessToken(): Promise<RefreshResult> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    if (!acquireLock()) {
      return waitForCrossTabRefresh();
    }

    try {
      return await postRefresh();
    } finally {
      releaseLock();
      setTimeout(() => {
        refreshInFlight = null;
      }, 0);
    }
  })();

  return refreshInFlight;
}

/** Proactively refresh before access token expiry (30m) when user returns to tab. */
export function scheduleProactiveSessionRefresh(isAuthenticated: boolean) {
  if (typeof document === "undefined" || !isAuthenticated) return () => undefined;

  const onVisible = () => {
    if (document.visibilityState !== "visible") return;
    void refreshSessionAccessToken();
  };

  document.addEventListener("visibilitychange", onVisible);
  return () => document.removeEventListener("visibilitychange", onVisible);
}
