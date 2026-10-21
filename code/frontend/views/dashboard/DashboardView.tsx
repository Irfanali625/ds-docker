"use client";

import { useState } from "react";
import { IconFileUpload, IconList, IconPhone } from "@tabler/icons-react";
import { validationApi, ApiError } from "@/lib/api";
import { PhoneType, ValidationMode, ValidationRun } from "@/types/phoneValidation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SingleValidation } from "@/components/phone-validation/SingleValidation";
import { BulkValidation } from "@/components/phone-validation/BulkValidation";
import { CsvValidation } from "@/components/phone-validation/CsvValidation";
import { ResultsPanel } from "@/components/phone-validation/ResultsPanel";
import { UpgradeModal } from "@/components/subscription/UpgradeModal";

const MODES: { value: ValidationMode; label: string; icon: typeof IconPhone }[] = [
  { value: "single", label: "Single number", icon: IconPhone },
  { value: "bulk", label: "Paste a list", icon: IconList },
  { value: "csv", label: "Upload CSV", icon: IconFileUpload },
];

export function DashboardView() {
  const [mode, setMode] = useState<ValidationMode>("single");
  const [phoneType, setPhoneType] = useState<PhoneType>("B2B");
  const [results, setResults] = useState<Partial<Record<ValidationMode, ValidationRun>>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const run = async (task: () => Promise<ValidationRun>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await task();
      setResults((prev) => ({ ...prev, [mode]: result }));
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const changeMode = (next: ValidationMode) => {
    if (loading) return;
    setMode(next);
    setError(null);
  };

  const current = results[mode];
  const requiresUpgrade = error instanceof ApiError && error.requiresUpgrade;

  return (
    <>
      <PageHeader
        title="Validate phone numbers"
        description="Check numbers against carrier records. Every run is saved to your history."
      />

      <Card>
        <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <SegmentedControl
            ariaLabel="Validation method"
            value={mode}
            onChange={changeMode}
            className="w-full lg:w-auto"
            options={MODES.map(({ value, label, icon: Icon }) => ({
              value,
              label: (
                <>
                  <Icon className="hidden h-4 w-4 sm:block" stroke={1.75} />
                  {label}
                </>
              ),
            }))}
          />
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-700">List type</span>
            <SegmentedControl
              ariaLabel="List type"
              value={phoneType}
              onChange={setPhoneType}
              options={[
                { value: "B2B", label: "B2B" },
                { value: "B2C", label: "B2C" },
              ]}
            />
          </div>
        </div>

        <div className="space-y-4 px-5 py-6 sm:px-6">
          {error && (
            <Alert
              tone="error"
              onDismiss={() => setError(null)}
              action={
                requiresUpgrade ? (
                  <Button size="sm" onClick={() => setShowUpgrade(true)}>
                    View plans
                  </Button>
                ) : undefined
              }
            >
              {error.message}
            </Alert>
          )}

          {mode === "single" && (
            <SingleValidation
              loading={loading}
              onSubmit={(phone) => run(() => validationApi.single(phone, phoneType))}
            />
          )}
          {mode === "bulk" && (
            <BulkValidation
              loading={loading}
              onSubmit={(numbers) => run(() => validationApi.bulk(numbers, phoneType))}
            />
          )}
          {mode === "csv" && (
            <CsvValidation
              loading={loading}
              onError={(message) => setError(new Error(message))}
              onSubmit={(file) => run(() => validationApi.csv(file, phoneType))}
            />
          )}
        </div>
      </Card>

      {current && (
        <div className="mt-6">
          <ResultsPanel key={current.historyId} run={current} />
        </div>
      )}

      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </>
  );
}
