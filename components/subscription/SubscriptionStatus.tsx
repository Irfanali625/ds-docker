"use client";

import { useState, useEffect } from "react";
import { subscriptionApi } from "@/lib/api";
import { SubscriptionStatusResponse } from "@/types/subscription";
import { IconCheck, IconX, IconCrown, IconRefresh, IconArrowUp } from "@tabler/icons-react";

interface SubscriptionStatusProps {
  onUpgrade?: () => void;
}

export function SubscriptionStatus({ onUpgrade }: SubscriptionStatusProps) {
  const [status, setStatus] = useState<SubscriptionStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await subscriptionApi.getStatus();
      setStatus(data);
    } catch (err: any) {
      console.error('Error loading subscription status:', err);
      const errorMessage = err.message || "Failed to load subscription status";
      setError(errorMessage);
      // If it's a network error, provide more details
      if (errorMessage.includes('Failed to fetch')) {
        setError("Unable to connect to server. Please check if the backend is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <button
            onClick={loadStatus}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!status) return null;

  const { usage, limit, premiumPrice } = status;
  const isPremium = usage.hasActiveSubscription;
  const isExceeded = limit.limitType === "exceeded";

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Subscription Status</h3>
        <button
          onClick={loadStatus}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          title="Refresh"
        >
          <IconRefresh className="w-5 h-5" />
        </button>
      </div>

      {isPremium ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
            <IconCrown className="w-8 h-8 text-indigo-600" />
            <div className="flex-1">
              <div className="font-semibold text-indigo-900">Premium Subscription Active</div>
              <div className="text-sm text-indigo-700">
                Unlimited validations until{" "}
                {usage.subscriptionEndDate
                  ? new Date(usage.subscriptionEndDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "N/A"}
              </div>
            </div>
            <span className="px-3 py-1 bg-indigo-600 text-white rounded-full text-sm font-semibold">
              ACTIVE
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-gray-800">Free Tier</div>
              <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm font-semibold">
                FREE
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Validations Used</span>
                  <span className="font-semibold text-gray-800">
                    {usage.freeValidationsUsed} / 5
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all ${
                      usage.freeValidationsRemaining === 0
                        ? "bg-red-500"
                        : usage.freeValidationsRemaining <= 2
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{
                      width: `${(usage.freeValidationsUsed / 5) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                {usage.freeValidationsRemaining > 0 ? (
                  <>
                    <IconCheck className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">
                      {usage.freeValidationsRemaining} free validation
                      {usage.freeValidationsRemaining !== 1 ? "s" : ""} remaining
                    </span>
                  </>
                ) : (
                  <>
                    <IconX className="w-5 h-5 text-red-500" />
                    <span className="text-red-600 font-semibold">
                      Free tier limit reached
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {isExceeded && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <IconX className="w-6 h-6 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-red-900 mb-1">
                    Upgrade Required
                  </div>
                  <div className="text-sm text-red-700 mb-3">
                    You've used all 5 free validations. Upgrade to premium for
                    unlimited validations.
                  </div>
                  <button
                    onClick={onUpgrade}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 active:bg-indigo-800 transition-all duration-200 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    <IconArrowUp className="w-4 h-4" stroke={2} />
                    <span>Upgrade to Premium - ${premiumPrice}/month</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {!isExceeded && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <IconCrown className="w-6 h-6 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-blue-900 mb-1">
                    Upgrade to Premium
                  </div>
                  <div className="text-sm text-blue-700 mb-3">
                    Get unlimited phone number validations for just ${premiumPrice}/month.
                  </div>
                  <button
                    onClick={onUpgrade}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 active:bg-indigo-800 transition-all duration-200 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    <IconArrowUp className="w-4 h-4" stroke={2} />
                    <span>Upgrade Now - ${premiumPrice}/month</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

