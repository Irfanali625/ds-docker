'use client';

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { User } from '@/types';
import { authApi, getAuthToken, setAuthToken, removeAuthToken, getUser, setUser, removeUser } from '@/lib/auth';
import { getCookie } from '@/utils/cookies';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const initializeAuth = (): { user: User | null; hasAuth: boolean } => {
    if (typeof window === 'undefined') return { user: null, hasAuth: false };
    try {
      const token = getCookie('auth_token');
      const userStr = localStorage.getItem('user');
      if (token && userStr) {
        const user = JSON.parse(userStr);
        return { user, hasAuth: true };
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    }
    return { user: null, hasAuth: false };
  };

  const initialState = initializeAuth();
  const [user, setUserState] = useState<User | null>(initialState.user);
  const [loading, setLoading] = useState(!initialState.hasAuth);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    if (initialState.hasAuth && initialState.user) {
      const token = getAuthToken();
      if (token) {
        authApi.getCurrentUser(token)
          .then((userData) => {
            setUserState(userData);
            setUser(userData);
          })
          .catch((error: any) => {
            if (error?.status === 401 || error?.status === 403) {
              removeAuthToken();
              removeUser();
              setUserState(null);
              setLoading(false);
            }
          });
      }
      return;
    }

    const token = getAuthToken();
    const savedUser = getUser();

    if (token && savedUser) {
      setUserState(savedUser);
      setLoading(false);
    } else {
      setUserState(null);
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    setAuthToken(response.token);
    setUser(response.user);
    setUserState(response.user);
  };

  const register = async (email: string, password: string, name: string) => {
    const response = await authApi.register({ email, password, name });
    setAuthToken(response.token);
    setUser(response.user);
    setUserState(response.user);
  };

  const logout = () => {
    removeAuthToken();
    removeUser();
    setUserState(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

