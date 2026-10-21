"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IconCheck } from "@tabler/icons-react";
import { subscriptionApi } from "@/lib/api";
import { Spinner } from "@/components/ui/Spinner";
import { StatusPage, primaryLinkClass, secondaryLinkClass } from "./StatusPage";

const POLL_INTERVAL_MS = 3000;
const MAX_ATTEMPTS = 10;

type State = "checking" | "active" | "pending";

export default function SubscriptionSuccessView() {
  const [state, setState] = useState<State>("checking");
  const [endDate, setEndDate] = useState<string | undefined>();

  // The subscription is created by the payment webhook, which can land a few seconds after the redirect.
  useEffect(() => {
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const check = async () => {
      attempts++;
      try {
        const { usage } = await subscriptionApi.getStatus();
        if (cancelled) return;
        if (usage.hasActiveSubscription) {
          setEndDate(usage.subscriptionEndDate);
          setState("active");
          return;
        }
      } catch {
        // Keep polling; a transient error should not end the check.
      }
      if (attempts >= MAX_ATTEMPTS) setState("pending");
      else timer = setTimeout(check, POLL_INTERVAL_MS);
    };

    check();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  return (
    <StatusPage
      icon={<IconCheck className="h-6 w-6" stroke={2.25} />}
      iconClassName="bg-emerald-50 text-emerald-600"
      title="Payment received"
      actions={
        <>
          <Link href="/dashboard" className={primaryLinkClass}>
            Go to dashboard
          </Link>
          <Link href="/dashboard/history" className={secondaryLinkClass}>
            View history
          </Link>
        </>
      }
    >
      {state === "checking" && (
        <p className="inline-flex items-center gap-2">
          <Spinner className="h-4 w-4 text-slate-400" />
          Activating your Premium plan
        </p>
      )}
      {state === "active" && (
        <p>
          Your Premium plan is active
          {endDate &&
            ` until ${new Date(endDate).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}`}
          . You can validate without limits.
        </p>
      )}
      {state === "pending" && (
        <p>
          Thanks for your payment. Activation is taking longer than usual and should complete
          within a few minutes. If your plan is still inactive after that, contact support with
          your payment receipt.
        </p>
      )}
    </StatusPage>
  );
}
