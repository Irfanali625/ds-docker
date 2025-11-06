'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [hasLocalAuth, setHasLocalAuth] = useState<boolean | null>(null);

  useEffect(() => {
    // Check localStorage on mount
    if (hasLocalAuth === null && typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('user');
      setHasLocalAuth(!!(token || savedUser));
    }
  }, [hasLocalAuth]);

  useEffect(() => {
    // Wait for loading to complete before checking authentication
    if (!loading && !hasChecked && hasLocalAuth !== null) {
      setHasChecked(true);
      
      // Check both isAuthenticated and user state, plus localStorage
      const isAuth = isAuthenticated || user || hasLocalAuth;
      
      // If we have any authentication indicator, allow access
      if (isAuth) {
        return; // User is authenticated, allow access
      }
      
      // No authentication found, redirect to login
      setIsRedirecting(true);
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || '/dashboard';
      router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
    }
  }, [isAuthenticated, loading, user, router, hasChecked, hasLocalAuth]);

  // Show loading state while checking authentication
  if (loading || !hasChecked || hasLocalAuth === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="text-xl text-gray-700 mb-2">
            Loading authentication...
          </div>
          <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-indigo-600 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show redirecting state if not authenticated
  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="text-xl text-gray-700 mb-2">
            Redirecting to login...
          </div>
          <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-indigo-600 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // If we have any authentication indicator, allow access
  if (isAuthenticated || user || hasLocalAuth) {
    return <>{children}</>;
  }

  // Fallback: if somehow we got here without authentication, redirect
  if (!isRedirecting) {
    setIsRedirecting(true);
    router.push('/login');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="text-xl text-gray-700 mb-2">
          Redirecting to login...
        </div>
      </div>
    </div>
  );
}

