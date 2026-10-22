"use client";

import { useMemo, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { cn } from "@/components/ui/cn";
import { PhoneValidationResult, ValidationRun, ValidationStatus } from "@/types/phoneValidation";
import { DownloadButton } from "./DownloadButton";
import { StatusBadge, formatDateTime, statusOf } from "./status";

const PREVIEW_LIMIT = 100;

type Filter = "ALL" | ValidationStatus;

function Stat({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="px-5 py-4 sm:px-6">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className={cn("mt-1 text-2xl font-semibold tabular-nums text-slate-900", tone)}>
        {value.toLocaleString()}
      </dd>
    </div>
  );
}

function Breakdown({ run }: { run: ValidationRun }) {
  if (!run.total) return null;
  const segments = [
    { label: "Valid", value: run.valid, bar: "bg-emerald-500" },
    { label: "Invalid", value: run.invalid, bar: "bg-red-500" },
    { label: "Not checked", value: run.unknown, bar: "bg-amber-400" },
  ];
  const pct = (n: number) => (n / run.total) * 100;

  return (
    <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
      <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
        {segments.map((s) =>
          s.value ? <span key={s.label} className={s.bar} style={{ width: `${pct(s.value)}%` }} /> : null
        )}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-slate-500">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-1.5">
            <span className={cn("h-2 w-2 rounded-full", s.bar)} />
            {s.label}
            <span className="font-medium tabular-nums text-slate-700">{Math.round(pct(s.value))}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ResultsTable({ results, showFilter }: { results: PhoneValidationResult[]; showFilter: boolean }) {
  const [filter, setFilter] = useState<Filter>("ALL");

  const filtered = useMemo(
    () => (filter === "ALL" ? results : results.filter((r) => statusOf(r) === filter)),
    [results, filter]
  );
  const visible = filtered.slice(0, PREVIEW_LIMIT);

  return (
    <div>
      {showFilter && (
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <SegmentedControl
            size="sm"
            ariaLabel="Filter results"
            value={filter}
            onChange={setFilter}
            options={[
              { value: "ALL", label: "All" },
              { value: "VALID", label: "Valid" },
              { value: "INVALID", label: "Invalid" },
              { value: "UNKNOWN", label: "Not checked" },
            ]}
          />
          {filtered.length > PREVIEW_LIMIT && (
            <p className="text-xs text-slate-500">
              Showing the first {PREVIEW_LIMIT} of {filtered.length.toLocaleString()}. Download the CSV for the full list.
            </p>
          )}
        </div>
      )}

      {visible.length === 0 ? (
        <p className="px-6 py-10 text-center text-sm text-slate-500">No numbers match this filter.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-5 py-2.5 sm:px-6">Number</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">E.164</th>
                <th className="px-4 py-2.5">National format</th>
                <th className="px-4 py-2.5 pr-6">Country</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((r, i) => (
                <tr key={`${r.phoneNumber}-${i}`} className="hover:bg-slate-50/60">
                  <td className="whitespace-nowrap px-5 py-2.5 font-mono text-[13px] text-slate-900 sm:px-6">
                    {r.phoneNumber}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge result={r} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 font-mono text-[13px] text-slate-600">
                    {r.formattedNumber || <span className="text-slate-300">None</span>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-slate-600">
                    {r.nationalFormat || <span className="text-slate-300">None</span>}
                  </td>
                  <td className="px-4 py-2.5 pr-6 text-slate-600">
                    {r.countryCode || <span className="text-slate-300">None</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function ResultsPanel({ run }: { run: ValidationRun }) {
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const isSingle = run.type === "single";

  const plural = (n: number, word: string) => `${n.toLocaleString()} ${word}${n === 1 ? "" : "s"}`;
  const notes = [
    run.duplicatesRemoved ? `${plural(run.duplicatesRemoved, "duplicate")} removed` : null,
    run.rowsSkipped ? `${plural(run.rowsSkipped, "row")} without a phone number skipped` : null,
  ].filter(Boolean);

  return (
    <Card>
      <CardHeader
        title={isSingle ? "Result" : "Results"}
        description={
          <>
            {run.phoneType} list, checked {formatDateTime(run.processedAt)}
            {notes.length > 0 && <>. {notes.join(", ")}.</>}
          </>
        }
        actions={<DownloadButton historyId={run.historyId} size="sm" onError={setDownloadError} />}
      />

      {(run.storageWarning || downloadError) && (
        <div className="px-5 pt-4 sm:px-6">
          <Alert tone="warning" onDismiss={downloadError ? () => setDownloadError(null) : undefined}>
            {downloadError || run.storageWarning}
          </Alert>
        </div>
      )}

      <dl className="grid grid-cols-2 divide-slate-200 border-b border-slate-200 sm:grid-cols-4 sm:divide-x">
        <Stat label="Total" value={run.total} />
        <Stat label="Valid" value={run.valid} tone="text-emerald-600" />
        <Stat label="Invalid" value={run.invalid} tone="text-red-600" />
        <Stat label="Not checked" value={run.unknown} tone={run.unknown ? "text-amber-600" : undefined} />
      </dl>
      <Breakdown run={run} />
      {run.unknown > 0 && isSingle && (
        <p className="border-b border-slate-200 px-5 py-3 text-sm text-amber-700 sm:px-6">
          The lookup could not be completed
          {run.results[0]?.error ? ` (${run.results[0].error.toLowerCase()})` : ""}. Try again in a moment.
        </p>
      )}
      <ResultsTable results={run.results} showFilter={!isSingle} />
    </Card>
  );
}
