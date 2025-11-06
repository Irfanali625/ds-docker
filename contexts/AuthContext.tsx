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
      // Immediately set user from localStorage to prevent logout on refresh
      setUserState(savedUser);
      
      // Ensure cookie is set (in case it was lost)
      setAuthToken(token);
      
      // Verify token is still valid in the background
      authApi.getCurrentUser(token)
        .then((userData) => {
          // Update with fresh user data if API call succeeds
          setUserState(userData);
          setUser(userData);
        })
        .catch((error) => {
          // Only clear if we get a 401/403 (unauthorized/forbidden)
          // Don't clear on network errors or other issues
          if (error?.status === 401 || error?.status === 403) {
            // Token is invalid, clear storage
            removeAuthToken();
            removeUser();
            setUserState(null);
          } else {
            // Network error or other issue - keep user logged in
            console.warn('Token verification failed, but keeping user logged in:', error);
          }
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

