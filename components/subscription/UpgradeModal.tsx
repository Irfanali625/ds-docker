"use client";

import { useState } from "react";
import { subscriptionApi } from "@/lib/api";
import { IconX, IconCrown, IconCheck, IconLoader, IconArrowUp } from "@tabler/icons-react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  premiumPrice: number;
}

export function UpgradeModal({
  isOpen,
  onClose,
  onSuccess,
  premiumPrice,
}: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      setError(null);
      await subscriptionApi.createSubscription();
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to create subscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <IconX className="w-6 h-6" />
        </button>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconCheck className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Subscription Activated!
            </h3>
            <p className="text-gray-600">
              You now have unlimited phone number validations for 30 days.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <IconCrown className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Upgrade to Premium
              </h3>
              <p className="text-gray-600">
                Get unlimited phone number validations
              </p>
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 mb-6 border border-indigo-200">
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-indigo-900 mb-1">
                  ${premiumPrice}
                </div>
                <div className="text-gray-600">per month</div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <IconCheck className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Unlimited validations</span>
                </div>
                <div className="flex items-center gap-2">
                  <IconCheck className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Single, bulk, and CSV validation</span>
                </div>
                <div className="flex items-center gap-2">
                  <IconCheck className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">30-day subscription</span>
                </div>
                <div className="flex items-center gap-2">
                  <IconCheck className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Full validation history access</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {loading ? (
                  <>
                    <IconLoader className="w-4 h-4 animate-spin" stroke={2} />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <IconArrowUp className="w-4 h-4" stroke={2} />
                    <span>Subscribe for ${premiumPrice}/month</span>
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                disabled={loading}
                className="w-full px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 active:bg-gray-400 disabled:opacity-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              Note: Payment gateway integration will be added later. For now, this is a manual subscription activation.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

