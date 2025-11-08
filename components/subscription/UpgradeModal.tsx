"use client";

import React, { useState } from "react";
import { subscriptionApi } from "@/lib/api";
import { IconX, IconCrown, IconCheck, IconLoader, IconArrowUp } from "@tabler/icons-react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  premiumPrice: number;
}

export function UpgradeModal({
  isOpen,
  onClose,
  premiumPrice,
}: UpgradeModalProps) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const providers: Array<{
    id: "stripe" | "square";
    name: string;
    description: string;
    icon: React.ReactNode;
  }> = [
    {
      id: "stripe",
      name: "Stripe",
      description: "Pay securely with debit/credit cards via Stripe Checkout.",
      icon: <IconArrowUp className="w-5 h-5 text-indigo-600" stroke={2} />,
    },
    {
      id: "square",
      name: "Square",
      description: "Use Square Payments with card support and secure checkout.",
      icon: <IconArrowUp className="w-5 h-5 text-indigo-600" stroke={2} />,
    },
  ];

  const handleProviderCheckout = async (provider: "stripe" | "square") => {
    try {
      setLoadingProvider(provider);
      setError(null);

      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const successUrl = `${origin}/subscription/success?provider=${provider}`;
      const cancelUrl = `${origin}/subscription/cancel?provider=${provider}`;

      const response = await subscriptionApi.createCheckout({
        provider,
        successUrl,
        cancelUrl,
      });

      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      } else {
        throw new Error("Failed to retrieve checkout URL");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create checkout session");
    } finally {
      setLoadingProvider(null);
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

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconCrown className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Upgrade to Premium
          </h3>
          <p className="text-gray-600">
            Choose a secure payment provider to unlock unlimited validations.
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
          {providers.map((provider) => (
            <button
              key={provider.id}
              onClick={() => handleProviderCheckout(provider.id)}
              disabled={loadingProvider !== null}
              className="w-full flex items-center justify-between gap-4 px-4 py-3 border border-indigo-200 rounded-lg bg-white hover:bg-indigo-50 transition-colors disabled:opacity-70"
            >
              <div className="flex items-center gap-3 text-left">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100">
                  {provider.icon}
                </span>
                <div>
                  <div className="font-semibold text-gray-800">{provider.name}</div>
                  <div className="text-sm text-gray-600">{provider.description}</div>
                </div>
              </div>
              {loadingProvider === provider.id ? (
                <IconLoader className="w-5 h-5 text-indigo-600 animate-spin" stroke={2} />
              ) : (
                <IconArrowUp className="w-5 h-5 text-indigo-600" stroke={2} />
              )}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          disabled={loadingProvider !== null}
          className="mt-4 w-full px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 active:bg-gray-400 disabled:opacity-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Close
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          Payments are processed securely via Stripe or Square. Your subscription activates automatically after payment.
        </p>
      </div>
    </div>
  );
}

