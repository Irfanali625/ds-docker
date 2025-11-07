"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { LoginView } from "@/views/auth/LoginView";

export default function LoginPage() {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check both isAuthenticated and user to handle restored sessions
    if (!loading && (isAuthenticated || user)) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, loading, user, router]);

  if (loading || isAuthenticated || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-xl text-gray-700">Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <LoginView />
    </div>
  );
}
