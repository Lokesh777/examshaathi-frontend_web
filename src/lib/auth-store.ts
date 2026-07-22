import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createElement } from "react";
import { api, type User } from "./api";

export type { User };

type AuthState = {
  user: User | null;
  isReady: boolean;
  setUser: (user: User) => void;
  clear: () => Promise<void>;
};

const KEY = "examsaathi.user";

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setUser(JSON.parse(raw) as User);
    } catch {
      /* ignore */
    }
    setReady(true);

    // Central 401 handler: any API call anywhere → clear session & bounce.
    const onUnauth = () => {
      localStorage.removeItem(KEY);
      setUser(null);
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth")) {
        window.location.assign("/auth");
      }
    };
    window.addEventListener("auth:unauthorized", onUnauth);
    return () => window.removeEventListener("auth:unauthorized", onUnauth);
  }, []);

  const persistUser = (u: User) => {
    localStorage.setItem(KEY, JSON.stringify(u));
    setUser(u);
  };

  const clear = async () => {
    try {
      await api.logout();
    } catch {
      /* ignore */
    }
    localStorage.removeItem(KEY);
    setUser(null);
  };

  return createElement(
    AuthContext.Provider,
    { value: { user, isReady, setUser: persistUser, clear } },
    children,
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}