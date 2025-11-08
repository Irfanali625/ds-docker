"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function SubscriptionCancelPage() {
  const searchParams = useSearchParams();
  const provider = searchParams.get("provider") || "stripe";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg max-w-xl w-full p-8 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 text-yellow-600 text-2xl font-bold">
          !
        </div>
        <h1 className="text-2xl font-bold text-gray-800">
          Payment Cancelled
        </h1>
        <p className="text-gray-600">
          Your {provider.toUpperCase()} checkout was cancelled. No charges were made.
          You can restart the upgrade process at any time.
        </p>
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 text-left text-sm text-yellow-700">
          <p className="font-semibold mb-1">Need help?</p>
          <p>If you experienced an issue during checkout, please reach out to support and we&apos;ll be happy to assist.</p>
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
            Try Again
          </Link>
        </div>
      </div>
    </div>
  );
}

