"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User } from "@/types";
import {
  authApi,
  setUser as saveUser,
  removeUser,
  getAuthToken,
} from "@/lib/auth";
import { useUserStore } from "@/zustand/userStore";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import cookies from "js-cookie";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  fetchAndSetUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, token } = useUserStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tokenFromCookie = getAuthToken();

    if (tokenFromCookie) {
      if (!token) {
        useUserStore.setState((state) => ({
          ...state,
          token: tokenFromCookie,
        }));
      }
      setLoading(false);
      return;
    }

    removeUser();
    setLoading(false);
  }, [token]);

  const fetchAndSetUser = async () => {
    try {
      const user = await api.me();
      const token = cookies.get("auth_token")!;
      const { setUser } = useUserStore.getState();
      setUser(user, token);
      return user;
    } catch (err) {
      console.error("Failed to fetch user:", err);
      const { clearAuth } = useUserStore.getState();
      clearAuth();
      cookies.remove("auth_token");
      throw err;
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    saveUser(response.user, response.token);
  };

  const register = async (email: string, password: string, name: string) => {
    const response = await authApi.register({ email, password, name });
    saveUser(response.user, response.token);
  };

  const logout = () => {
    removeUser();
    router.push("/login");
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    fetchAndSetUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
