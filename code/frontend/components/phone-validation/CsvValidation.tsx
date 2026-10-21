"use client";

import { DragEvent, useRef, useState } from "react";
import { IconFileSpreadsheet, IconFileUpload, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { MAX_CSV_BYTES, MAX_CSV_ROWS } from "@/types/phoneValidation";

const SAMPLE_CSV = "Name,Phone,Company\nJane Smith,+14155552671,Acme Inc\nJohn Doe,(212) 555-0147,Globex\n";

function downloadSample() {
  const url = URL.createObjectURL(new Blob([SAMPLE_CSV], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "sample-numbers.csv";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CsvValidation({
  loading,
  onSubmit,
  onError,
}: {
  loading: boolean;
  onSubmit: (file: File) => void;
  onError: (message: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const accept = (candidate?: File | null) => {
    if (!candidate) return;
    if (!candidate.name.toLowerCase().endsWith(".csv")) {
      onError("Choose a file with a .csv extension.");
      return;
    }
    if (candidate.size > MAX_CSV_BYTES) {
      onError("CSV files can be at most 10 MB.");
      return;
    }
    setFile(candidate);
  };

  const clear = () => {
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (!loading) accept(e.dataTransfer.files?.[0]);
  };

  return (
    <div>
      <input
        ref={inputRef}
        id="csv-upload"
        type="file"
        accept=".csv,text/csv"
        className="sr-only"
        onChange={(e) => accept(e.target.files?.[0])}
      />

      {file ? (
        <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600 ring-1 ring-slate-200">
            <IconFileSpreadsheet className="h-5 w-5" stroke={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">{file.name}</p>
            <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={clear}
            disabled={loading}
            className="rounded-md p-1.5 text-slate-400 hover:bg-white hover:text-slate-600 disabled:opacity-50"
            aria-label="Remove file"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label
          htmlFor="csv-upload"
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors",
            dragging
              ? "border-brand-400 bg-brand-50"
              : "border-slate-300 hover:border-slate-400 hover:bg-slate-50"
          )}
        >
          <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <IconFileUpload className="h-5 w-5" stroke={1.75} />
          </span>
          <p className="text-sm text-slate-700">
            <span className="font-medium text-brand-700">Choose a file</span> or drag it here
          </p>
          <p className="mt-1 text-xs text-slate-500">
            CSV up to 10 MB and {MAX_CSV_ROWS.toLocaleString()} rows
          </p>
        </label>
      )}

      <div className="mt-3 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Numbers are read from the column named phone, mobile or similar, otherwise the first column.{" "}
          <button
            type="button"
            onClick={downloadSample}
            className="font-medium text-brand-700 hover:text-brand-800"
          >
            Download a sample file
          </button>
        </p>
        <Button
          onClick={() => file && onSubmit(file)}
          loading={loading}
          disabled={!file}
          icon={<IconFileUpload className="h-4 w-4" stroke={2} />}
          className="shrink-0"
        >
          {loading ? "Processing file" : "Validate file"}
        </Button>
      </div>
      {loading && (
        <p className="mt-3 text-sm text-slate-500">
          Large files take a little while. Keep this page open until the results appear.
        </p>
      )}
    </div>
  );
}
