"use client";

import { useCallback, useEffect, useState } from "react";
import { subscriptionApi } from "@/lib/api";
import { SubscriptionStatusResponse } from "@/types/subscription";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/components/ui/cn";

export function SubscriptionStatus({ onUpgrade }: { onUpgrade?: () => void }) {
  const [status, setStatus] = useState<SubscriptionStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setStatus(await subscriptionApi.getStatus());
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <Alert
        tone="error"
        action={
          <Button size="sm" variant="secondary" onClick={load}>
            Try again
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  if (!status) {
    return (
      <Card className="space-y-3 p-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-2 w-full" />
      </Card>
    );
  }

  const { usage, premiumPrice } = status;

  if (usage.hasActiveSubscription) {
    return (
      <Card>
        <CardHeader
          title="Premium plan"
          description={
            usage.subscriptionEndDate
              ? `Renews or expires on ${new Date(usage.subscriptionEndDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}`
              : undefined
          }
          actions={<Badge tone="success" dot>Active</Badge>}
        />
      </Card>
    );
  }

  const limit = usage.freeValidationsUsed + usage.freeValidationsRemaining;
  const pct = limit ? Math.min(100, (usage.freeValidationsUsed / limit) * 100) : 100;

  return (
    <Card>
      <CardHeader
        title="Free plan"
        description={`${usage.freeValidationsRemaining} of ${limit} free validations left`}
        actions={
          <Button size="sm" onClick={onUpgrade}>
            Upgrade for ${premiumPrice.toFixed(2)}/month
          </Button>
        }
      />
      <CardBody>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={cn(
              "h-full rounded-full",
              usage.freeValidationsRemaining === 0 ? "bg-red-500" : "bg-brand-600"
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </CardBody>
    </Card>
  );
}
