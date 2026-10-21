"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import cookies from "js-cookie";
import { User } from "@/types";
import { AUTH_COOKIE, authApi, onUnauthorized } from "@/lib/api";

const USER_CACHE_KEY = "vnc_user";
const TOKEN_TTL_DAYS = 7;

interface AuthContextType {
  user: User | null;
  /** True until the stored session has been checked against the API. */
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateSession: (user: User, token?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readCachedUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function writeCachedUser(user: User | null) {
  try {
    if (user) localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_CACHE_KEY);
  } catch {
    // Storage can be unavailable (private mode); the cookie is the source of truth.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const updateSession = useCallback((nextUser: User, token?: string) => {
    if (token) {
      cookies.set(AUTH_COOKIE, token, {
        expires: TOKEN_TTL_DAYS,
        sameSite: "lax",
        secure: window.location.protocol === "https:",
      });
    }
    writeCachedUser(nextUser);
    setUser(nextUser);
  }, []);

  const clearSession = useCallback(() => {
    cookies.remove(AUTH_COOKIE);
    writeCachedUser(null);
    setUser(null);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    router.replace("/login");
  }, [clearSession, router]);

  // Any 401 from the API means the session is gone: sign out and come back here after login.
  useEffect(() => {
    onUnauthorized(() => {
      clearSession();
      const here = window.location.pathname + window.location.search;
      router.replace(`/login?redirect=${encodeURIComponent(here)}`);
    });
  }, [clearSession, router]);

  // Restore the session on first load: show the cached user immediately, then confirm with the API.
  useEffect(() => {
    if (!cookies.get(AUTH_COOKIE)) {
      writeCachedUser(null);
      setLoading(false);
      return;
    }

    const cached = readCachedUser();
    if (cached) setUser(cached);

    authApi
      .me()
      .then((fresh) => updateSession(fresh))
      .catch((err) => {
        // Keep the cached session on network errors; 401s are handled by onUnauthorized.
        if (!cached || err?.status === 401) clearSession();
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Protected pages rendered after a client-side sign out should not linger.
  useEffect(() => {
    if (!loading && !user && pathname?.startsWith("/dashboard")) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, pathname, router]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { user, token } = await authApi.login(email, password);
      updateSession(user, token);
    },
    [updateSession]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const { user, token } = await authApi.register(name, email, password);
      updateSession(user, token);
    },
    [updateSession]
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      updateSession,
    }),
    [user, loading, login, register, logout, updateSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

/** Only allow same-site relative redirects after login. */
export function safeRedirect(target: string | null | undefined, fallback = "/dashboard") {
  if (!target || !target.startsWith("/") || target.startsWith("//") || target.startsWith("/\\")) {
    return fallback;
  }
  return target;
}
