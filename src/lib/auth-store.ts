import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createElement } from "react";
import type { User } from "@/types/api";
import { authApi } from "@/api/authApi";
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
  subscribeAccessToken,
} from "./token-store";
import { AUTH_ROUTES } from "@/constants/auth";

export type { User };

type AuthState = {
  user: User | null;
  /** Access token — memory/context only, never localStorage. */
  accessToken: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  /** Called after login / login-OTP / verify-email. */
  login: (user: User, accessToken?: string) => void;
  logout: () => Promise<void>;
  /** Called after login / login-OTP: token stays in memory only. */
  setSession: (user: User, accessToken?: string) => void;
  setUser: (user: User) => void;
  clear: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setToken] = useState<string | null>(() => getAccessToken());
  const [isReady, setReady] = useState(false);

  // Mirror the in-memory token (including silent 401 refreshes) into state.
  useEffect(() => subscribeAccessToken(setToken), []);

  useEffect(() => {
    let cancelled = false;

    // Boot: the access token only lives in memory, so rehydrate the session
    // from the HttpOnly refresh cookie, then load the profile.
    (async () => {
      try {
        // The token is memory-only, so a reload rehydrates the session from
        // the httpOnly refresh cookie.
        const token = getAccessToken() ?? (await authApi.refreshToken());
        if (token) {
          const me = await authApi.getMe();
          if (!cancelled && me?.data) setUser(me.data);
        }
      } catch {
        /* not signed in */
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    // Central 401 handler: any API call anywhere → clear session & bounce.
    const onUnauth = () => {
      clearAccessToken();
      setUser(null);
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth")) {
        window.location.assign(AUTH_ROUTES.login);
      }
    };
    window.addEventListener("auth:unauthorized", onUnauth);
    return () => {
      cancelled = true;
      window.removeEventListener("auth:unauthorized", onUnauth);
    };
  }, []);

  const setSession = useCallback((u: User, accessToken?: string) => {
    if (accessToken) setAccessToken(accessToken);
    setUser(u);
  }, []);

  const clear = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /* ignore */
    }
    clearAccessToken();
    setUser(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      accessToken,
      isAuthenticated: !!user,
      isReady,
      login: setSession,
      logout: clear,
      setSession,
      setUser,
      clear,
    }),
    [user, accessToken, isReady, setSession, clear],
  );

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}