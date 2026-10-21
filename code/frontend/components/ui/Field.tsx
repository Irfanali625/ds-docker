"use client";

import { forwardRef, InputHTMLAttributes, ReactNode, useId, useState } from "react";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { cn } from "./cn";

export const inputClass = (invalid?: boolean) =>
  cn(
    "block w-full rounded-lg border bg-white px-3 text-sm text-slate-900 shadow-sm transition-colors",
    "placeholder:text-slate-400 focus:outline-none focus:ring-4",
    "disabled:bg-slate-50 disabled:text-slate-500",
    invalid
      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
      : "border-slate-300 focus:border-brand-500 focus:ring-brand-100"
  );

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: ReactNode;
  trailing?: ReactNode;
}

export const TextField = forwardRef<HTMLInputElement, FieldProps>(function TextField(
  { label, error, hint, trailing, id, className, ...props },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className={className}>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={cn(inputClass(!!error), "h-10", trailing ? "pr-10" : undefined)}
          {...props}
        />
        {trailing && <div className="absolute inset-y-0 right-0 flex items-center pr-2">{trailing}</div>}
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1.5 text-sm text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export const PasswordField = forwardRef<HTMLInputElement, Omit<FieldProps, "type" | "trailing">>(
  function PasswordField(props, ref) {
    const [visible, setVisible] = useState(false);
    const Icon = visible ? IconEyeOff : IconEye;

    return (
      <TextField
        ref={ref}
        type={visible ? "text" : "password"}
        trailing={
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="rounded-md p-1.5 text-slate-400 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label={visible ? "Hide password" : "Show password"}
          >
            <Icon className="h-4 w-4" stroke={1.75} />
          </button>
        }
        {...props}
      />
    );
  }
);
