"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { IconHistory, IconRefresh } from "@tabler/icons-react";
import { validationApi } from "@/lib/api";
import { HistoryEntry, ValidationMode } from "@/types/phoneValidation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { DownloadButton } from "@/components/phone-validation/DownloadButton";
import { formatDateTime } from "@/components/phone-validation/status";

const MODE_LABELS: Record<ValidationMode, string> = {
  single: "Single",
  bulk: "List",
  csv: "CSV",
};

type Filter = "ALL" | "B2B" | "B2C";

function SummaryCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
    </Card>
  );
}

function ValidShare({ entry }: { entry: HistoryEntry }) {
  // Runs saved before per-status counts were recorded only have a total.
  if (entry.valid === undefined) return <span className="text-slate-400">Not recorded</span>;

  const pct = entry.total ? Math.round((entry.valid / entry.total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="tabular-nums text-slate-600">
        {entry.valid.toLocaleString()} <span className="text-slate-400">({pct}%)</span>
      </span>
    </div>
  );
}

function LoadingRows() {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-6 px-6 py-4">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="ml-auto h-8 w-28" />
        </div>
      ))}
    </div>
  );
}

export function HistoryView() {
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("ALL");

  const load = useCallback(async () => {
    setError(null);
    setHistory(null);
    try {
      setHistory(await validationApi.history());
    } catch (err: any) {
      setError(err.message);
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const rows = useMemo(
    () => (history ?? []).filter((h) => filter === "ALL" || h.phoneType === filter),
    [history, filter]
  );

  const totals = useMemo(() => {
    const list = history ?? [];
    const numbers = list.reduce((sum, h) => sum + (h.total || 0), 0);
    const counted = list.filter((h) => h.valid !== undefined);
    const countedTotal = counted.reduce((sum, h) => sum + h.total, 0);
    const countedValid = counted.reduce((sum, h) => sum + (h.valid || 0), 0);
    return {
      runs: list.length,
      numbers,
      validRate: countedTotal ? `${Math.round((countedValid / countedTotal) * 100)}%` : "None yet",
    };
  }, [history]);

  const loading = history === null;

  return (
    <>
      <PageHeader
        title="History"
        description="Every validation run, with its results file."
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={load}
            disabled={loading}
            icon={<IconRefresh className="h-4 w-4" />}
          >
            Refresh
          </Button>
        }
      />

      {!loading && !error && history.length > 0 && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <SummaryCard label="Runs" value={totals.runs.toLocaleString()} />
          <SummaryCard label="Numbers checked" value={totals.numbers.toLocaleString()} />
          <SummaryCard label="Valid rate" value={totals.validRate} hint="Across runs with recorded counts" />
        </div>
      )}

      {(error || downloadError) && (
        <Alert
          tone="error"
          className="mb-4"
          onDismiss={downloadError ? () => setDownloadError(null) : undefined}
          action={
            error ? (
              <Button size="sm" variant="secondary" onClick={load}>
                Try again
              </Button>
            ) : undefined
          }
        >
          {error || downloadError}
        </Alert>
      )}

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-3 sm:px-6">
          <h2 className="text-sm font-semibold text-slate-900">Validation runs</h2>
          <SegmentedControl
            size="sm"
            ariaLabel="Filter by list type"
            value={filter}
            onChange={setFilter}
            options={[
              { value: "ALL", label: "All" },
              { value: "B2B", label: "B2B" },
              { value: "B2C", label: "B2C" },
            ]}
          />
        </div>

        {loading ? (
          <LoadingRows />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<IconHistory className="h-5 w-5" />}
            title={history.length ? "No runs for this list type" : "No validation runs yet"}
            description={
              history.length
                ? "Switch the filter to see your other runs."
                : "Runs appear here after you validate a number, a list, or a CSV file."
            }
            action={
              !history.length && !error ? (
                <Link
                  href="/dashboard"
                  className="inline-flex h-9 items-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
                >
                  Validate numbers
                </Link>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-2.5 sm:px-6">Date</th>
                  <th className="px-4 py-2.5">Method</th>
                  <th className="px-4 py-2.5">List</th>
                  <th className="px-4 py-2.5 text-right">Numbers</th>
                  <th className="px-4 py-2.5">Valid</th>
                  <th className="px-5 py-2.5 text-right sm:px-6">
                    <span className="sr-only">Download</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/60">
                    <td className="whitespace-nowrap px-5 py-3 text-slate-900 sm:px-6">
                      {formatDateTime(h.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{MODE_LABELS[h.type] ?? h.type}</td>
                    <td className="px-4 py-3">
                      <Badge tone={h.phoneType === "B2C" ? "neutral" : "brand"}>
                        {h.phoneType || "B2B"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-900">
                      {h.total.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <ValidShare entry={h} />
                    </td>
                    <td className="px-5 py-2 text-right sm:px-6">
                      {h.filePath && (
                        <DownloadButton
                          historyId={h.id}
                          label="Download"
                          size="sm"
                          variant="ghost"
                          onError={setDownloadError}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
