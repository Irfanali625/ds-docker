import { IconPhoneCheck } from "@tabler/icons-react";
import { cn } from "./cn";

export function Logo({ inverted, className }: { inverted?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg",
          inverted ? "bg-white text-brand-700" : "bg-brand-600 text-white"
        )}
      >
        <IconPhoneCheck className="h-[18px] w-[18px]" stroke={2} />
      </span>
      <span
        className={cn(
          "text-[15px] font-semibold tracking-tight",
          inverted ? "text-white" : "text-slate-900"
        )}
      >
        Valid Number Check
      </span>
    </span>
  );
}
