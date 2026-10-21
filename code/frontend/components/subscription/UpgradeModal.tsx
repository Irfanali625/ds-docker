"use client";

import { useEffect, useState } from "react";
import { IconCheck, IconX } from "@tabler/icons-react";
import { subscriptionApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

const FEATURES = [
  "Unlimited validations for 30 days",
  "Single number, list and CSV validation",
  "Full history with downloadable results",
];

export function UpgradeModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [price, setPrice] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    subscriptionApi
      .getStatus()
      .then((s) => setPrice(s.premiumPrice))
      .catch(() => setPrice(null));

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !submitting && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose, submitting]);

  if (!isOpen) return null;

  const checkout = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const origin = window.location.origin;
      const { checkoutUrl } = await subscriptionApi.createCheckout({
        provider: "square",
        successUrl: `${origin}/subscription/success`,
        cancelUrl: `${origin}/subscription/cancel`,
      });
      window.location.href = checkoutUrl;
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={() => !submitting && onClose()} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-title"
        className="relative w-full max-w-md rounded-xl bg-white shadow-overlay"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="absolute right-4 top-4 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close"
        >
          <IconX className="h-5 w-5" />
        </button>

        <div className="px-6 pb-6 pt-7">
          <p className="text-sm font-medium text-brand-700">Premium</p>
          <h2 id="upgrade-title" className="mt-1 text-xl font-semibold text-slate-900">
            Upgrade your plan
          </h2>
          <p className="mt-4 flex items-baseline gap-1">
            <span className="text-4xl font-semibold tracking-tight text-slate-900">
              {price !== null ? `$${price.toFixed(2)}` : "..."}
            </span>
            <span className="text-sm text-slate-500">per month</span>
          </p>

          <ul className="mt-6 space-y-3">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm text-slate-700">
                <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" stroke={2.5} />
                {feature}
              </li>
            ))}
          </ul>

          {error && (
            <Alert tone="error" className="mt-6">
              {error}
            </Alert>
          )}

          <Button size="lg" fullWidth className="mt-6" loading={submitting} onClick={checkout}>
            {submitting ? "Opening checkout" : "Continue to checkout"}
          </Button>
          <p className="mt-3 text-center text-xs text-slate-500">
            Payments are handled by Square. Your plan activates as soon as payment completes.
          </p>
        </div>
      </div>
    </div>
  );
}
