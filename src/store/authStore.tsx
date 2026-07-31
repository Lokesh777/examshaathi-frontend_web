"use client";

// Auth session state (user + in-memory access token). API calls live in
// src/services/auth/authService.ts — components use the useAuth() hook.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "@/types/auth.types";
import {
  fetchCurrentUser,
  logoutUser,
  logoutUserFromAllDevices,
  refreshSessionToken,
} from "@/services/auth/authService";
import { clearAccessToken, getAccessToken, setAccessToken, subscribeAccessToken } from "@/store/tokenStore";
import { AUTH_ROUTES } from "@/constants/auth";

export type AuthSessionState = {
  user: User | null;
  /** Access token — memory only, never localStorage. */
  accessToken: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  /** Stores user + token after login / email verification. */
  setSession: (user: User, accessToken?: string) => void;
  setUser: (user: User) => void;
  /** Calls the logout endpoint and wipes the local session. */
  clearSession: () => Promise<void>;
  /** Logs out of every device, then wipes the local session. */
  clearAllSessions: () => Promise<void>;
};

const AuthContext = createContext<AuthSessionState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setToken] = useState<string | null>(() => getAccessToken());
  const [isReady, setReady] = useState(false);

  // Mirror the in-memory token (including silent 401 refreshes) into state.
  useEffect(() => subscribeAccessToken(setToken), []);

  useEffect(() => {
    let cancelled = false;

    // Boot: the token is memory-only, so a reload rehydrates the session from
    // the httpOnly refresh cookie, then loads the profile.
    (async () => {
      try {
        const token = getAccessToken() ?? (await refreshSessionToken());
        if (token) {
          const me = await fetchCurrentUser();
          if (!cancelled && me?.data) setUser(me.data);
        }
      } catch {
        /* not signed in */
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    // Central 401 handler (dispatched by the axios interceptor).
    const onUnauthorized = () => {
      clearAccessToken();
      setUser(null);
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth")) {
        window.location.assign(AUTH_ROUTES.login);
      }
    };
    window.addEventListener("auth:unauthorized", onUnauthorized);
    return () => {
      cancelled = true;
      window.removeEventListener("auth:unauthorized", onUnauthorized);
    };
  }, []);

  const setSession = useCallback((nextUser: User, token?: string) => {
    if (token) setAccessToken(token);
    setUser(nextUser);
  }, []);

  const clearSession = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      /* ignore — local session is cleared regardless */
    }
    clearAccessToken();
    setUser(null);
  }, []);

  const clearAllSessions = useCallback(async () => {
    try {
      await logoutUserFromAllDevices();
    } catch {
      /* ignore — local session is cleared regardless */
    }
    clearAccessToken();
    setUser(null);
  }, []);

  const value = useMemo<AuthSessionState>(
    () => ({
      user,
      accessToken,
      isAuthenticated: !!user,
      isReady,
      setSession,
      setUser,
      clearSession,
      clearAllSessions,
    }),
    [user, accessToken, isReady, setSession, clearSession, clearAllSessions],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthSessionState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
