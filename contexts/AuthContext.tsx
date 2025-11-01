'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { authApi, getAuthToken, setAuthToken, removeAuthToken, getUser, setUser, removeUser } from '@/lib/auth';

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
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = getAuthToken();
    const savedUser = getUser();

    if (token && savedUser) {
      // Verify token is still valid
      authApi.getCurrentUser(token)
        .then((userData) => {
          setUserState(userData);
          setUser(userData);
        })
        .catch(() => {
          // Token invalid, clear storage
          removeAuthToken();
          removeUser();
        })
        .finally(() => setLoading(false));
    } else {
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
    removeAuthToken(); // This also removes the cookie
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

