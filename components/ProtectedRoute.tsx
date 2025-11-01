'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        setIsRedirecting(true);
        // Get redirect from current URL search params
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect') || '/dashboard';
        router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
      }
    }
  }, [isAuthenticated, loading, router]);

  // Show loading or redirecting state
  if (loading || isRedirecting || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="text-xl text-gray-700 mb-2">
            {loading ? 'Loading authentication...' : 'Redirecting to login...'}
          </div>
          <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-indigo-600 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Only render children if authenticated
  return <>{children}</>;
}

