"use client";

import { useState } from "react";
import { IconChartBar, IconFileUpload, IconList, IconPhone } from "@tabler/icons-react";
import { validationApi, ApiError } from "@/lib/api";
import { PhoneType, ValidationMode, ValidationRun } from "@/types/phoneValidation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
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

const STATUS_GUIDE: { tone: "success" | "danger" | "warning"; label: string; body: string }[] = [
  { tone: "success", label: "Valid", body: "A real number the carrier recognises." },
  { tone: "danger", label: "Invalid", body: "Not an assigned or correctly formed number." },
  { tone: "warning", label: "Not checked", body: "The lookup could not finish. Try again later." },
];

function ResultsPlaceholder() {
  return (
    <div className="overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50/50">
      <div className="flex flex-col items-center px-6 pb-8 pt-10 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-500 shadow-card ring-1 ring-slate-200">
          <IconChartBar className="h-5 w-5" stroke={1.75} />
        </span>
        <h2 className="mt-4 text-sm font-semibold text-slate-900">Results will appear here</h2>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          Run a validation above. Each number is marked with one of these statuses.
        </p>
      </div>
      <ul className="grid gap-px border-t border-slate-200 bg-slate-200 sm:grid-cols-3">
        {STATUS_GUIDE.map((item) => (
          <li key={item.label} className="bg-white px-5 py-4 sm:px-6">
            <Badge tone={item.tone} dot>
              {item.label}
            </Badge>
            <p className="mt-2 text-sm text-slate-600">{item.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

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

      <div className="mt-6">
        {current ? (
          <ResultsPanel key={current.historyId} run={current} />
        ) : (
          <ResultsPlaceholder />
        )}
      </div>

      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </>
  );
}
