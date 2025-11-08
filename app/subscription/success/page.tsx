"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const provider = searchParams.get("provider") || "stripe";

  useEffect(() => {
    // Refresh subscription status when returning to dashboard
    const timeout = setTimeout(() => {
      router.refresh();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg max-w-xl w-full p-8 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 text-2xl font-bold">
          ✓
        </div>
        <h1 className="text-2xl font-bold text-gray-800">
          Payment Successful
        </h1>
        <p className="text-gray-600">
          Thank you for upgrading! We are processing your {provider.toUpperCase()} payment. Your premium subscription will activate automatically within a few moments.
        </p>
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-left text-sm text-indigo-700">
          <p className="font-semibold mb-1">What&apos;s next?</p>
          <ul className="list-disc list-inside space-y-1">
            <li>You can continue validating phone numbers without limitations.</li>
            <li>If you don&apos;t see premium access immediately, refresh the dashboard.</li>
            <li>Contact support if you need any assistance.</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Return to Dashboard
          </Link>
          <Link
            href="/subscription"
            className="px-6 py-2.5 bg-white text-indigo-600 border border-indigo-200 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
          >
            View Subscription Status
          </Link>
        </div>
      </div>
    </div>
  );
}

