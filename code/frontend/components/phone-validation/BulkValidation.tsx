"use client";

import { FormEvent, useMemo, useState } from "react";
import { IconListCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { inputClass } from "@/components/ui/Field";
import { cn } from "@/components/ui/cn";
import { MAX_BULK_NUMBERS } from "@/types/phoneValidation";

/** Accepts one number per line, or comma / semicolon separated. */
export function parseNumberList(text: string): string[] {
  return text
    .split(/[\n,;]+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function BulkValidation({
  loading,
  onSubmit,
}: {
  loading: boolean;
  onSubmit: (phoneNumbers: string[]) => void;
}) {
  const [text, setText] = useState("");
  const numbers = useMemo(() => parseNumberList(text), [text]);
  const tooMany = numbers.length > MAX_BULK_NUMBERS;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (numbers.length && !tooMany) onSubmit(numbers);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-1.5 flex items-baseline justify-between">
        <label htmlFor="bulk-phones" className="text-sm font-medium text-slate-700">
          Phone numbers
        </label>
        <span
          className={cn("text-xs tabular-nums", tooMany ? "font-medium text-red-600" : "text-slate-500")}
        >
          {numbers.length.toLocaleString()} / {MAX_BULK_NUMBERS.toLocaleString()}
        </span>
      </div>
      <textarea
        id="bulk-phones"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={9}
        spellCheck={false}
        placeholder={"+14155552671\n+442071838750\n(212) 555-0147"}
        className={cn(inputClass(tooMany), "resize-y py-2.5 font-mono text-[13px] leading-6")}
      />
      <div className="mt-3 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className={cn("text-sm", tooMany ? "text-red-600" : "text-slate-500")}>
          {tooMany
            ? `Remove ${(numbers.length - MAX_BULK_NUMBERS).toLocaleString()} numbers or use CSV upload instead.`
            : "One number per line. Duplicates are checked once."}
        </p>
        <div className="flex items-center gap-2">
          {text && !loading && (
            <Button variant="ghost" onClick={() => setText("")}>
              Clear
            </Button>
          )}
          <Button
            type="submit"
            loading={loading}
            disabled={!numbers.length || tooMany}
            icon={<IconListCheck className="h-4 w-4" stroke={2} />}
          >
            {loading
              ? `Checking ${numbers.length.toLocaleString()} numbers`
              : numbers.length
              ? `Validate ${numbers.length.toLocaleString()} ${numbers.length === 1 ? "number" : "numbers"}`
              : "Validate"}
          </Button>
        </div>
      </div>
      {loading && numbers.length > 50 && (
        <p className="mt-3 text-sm text-slate-500">
          Large lists take a little while. Keep this page open until the results appear.
        </p>
      )}
    </form>
  );
}
