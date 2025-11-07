'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getCookie } from '@/utils/cookies';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Don't do anything until component is mounted and auth is loaded
    if (!mounted || loading) {
      return;
    }

    // If user is authenticated, allow access
    if (user || isAuthenticated) {
      return;
    }

    // Double-check cookies and localStorage before redirecting
    const token = getCookie('auth_token');
    const savedUserStr = localStorage.getItem('user');
    
    // If we have auth data, wait a bit for state to update
    if (token && savedUserStr) {
      // Give AuthContext time to restore state
      const timer = setTimeout(() => {
        // Check again after timeout
        if (!user && !isAuthenticated) {
          // Still not authenticated, redirect
          const params = new URLSearchParams(window.location.search);
          const redirect = params.get('redirect') || '/dashboard';
          router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
        }
      }, 300);
      return () => clearTimeout(timer);
    }

    // No auth data found, redirect to login
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect') || '/dashboard';
    router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
  }, [mounted, loading, isAuthenticated, user, router]);

  // Show loading while mounting or auth is loading
  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="text-xl text-gray-700 mb-2">
            Loading...
          </div>
          <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-indigo-600 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // If authenticated, show content
  if (user || isAuthenticated) {
    return <>{children}</>;
  }

  // Final fallback - check cookies one more time
  if (typeof window !== 'undefined') {
    const token = getCookie('auth_token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      // Auth exists, show loading while state restores
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="text-center">
            <div className="text-xl text-gray-700 mb-2">
              Loading...
            </div>
          </div>
        </div>
      );
    }
  }

  // Not authenticated - show redirecting message
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

