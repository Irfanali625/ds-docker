import { User, AuthResponse } from "@/types";
import { useUserStore } from "@/zustand/userStore";
import cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

interface LoginData {
  email: string;
  password: string;
}

export const authApi = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Registration failed");
    }

    return response.json();
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Login failed");
    }

    return response.json();
  },
};

export const setAuthToken = (token: string): void => {
  cookies.set("auth_token", token, { expires: 7 });
};

export const getAuthToken = (): string | undefined => {
  return cookies.get("auth_token");
};

export const removeAuthToken = (): void => {
  cookies.remove("auth_token");
};

export const setUser = (user: User, token: string): void => {
  const { setUser } = useUserStore.getState();
  setUser(user, token);
  setAuthToken(token);
};

export const removeUser = (): void => {
  const { clearAuth } = useUserStore.getState();
  clearAuth();
  removeAuthToken();
};
