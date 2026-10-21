import { ReactNode } from "react";
import { cn } from "./cn";

type Tone = "neutral" | "success" | "danger" | "warning" | "brand";

const tones: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  danger: "bg-red-50 text-red-700 ring-red-200",
  warning: "bg-amber-50 text-amber-800 ring-amber-200",
  brand: "bg-brand-50 text-brand-700 ring-brand-200",
};

const dots: Record<Tone, string> = {
  neutral: "bg-slate-400",
  success: "bg-emerald-500",
  danger: "bg-red-500",
  warning: "bg-amber-500",
  brand: "bg-brand-500",
};

export function Badge({
  tone = "neutral",
  dot,
  children,
  className,
}: {
  tone?: Tone;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        tones[tone],
        className
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dots[tone])} />}
      {children}
    </span>
  );
}
