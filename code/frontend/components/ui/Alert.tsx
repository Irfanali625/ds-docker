import { ReactNode } from "react";
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCircleCheck,
  IconInfoCircle,
  IconX,
} from "@tabler/icons-react";
import { cn } from "./cn";

type Tone = "error" | "warning" | "success" | "info";

const tones: Record<Tone, { box: string; icon: typeof IconInfoCircle }> = {
  error: { box: "border-red-200 bg-red-50 text-red-800", icon: IconAlertCircle },
  warning: { box: "border-amber-200 bg-amber-50 text-amber-800", icon: IconAlertTriangle },
  success: { box: "border-emerald-200 bg-emerald-50 text-emerald-800", icon: IconCircleCheck },
  info: { box: "border-brand-200 bg-brand-50 text-brand-900", icon: IconInfoCircle },
};

export function Alert({
  tone = "info",
  title,
  children,
  action,
  onDismiss,
  className,
}: {
  tone?: Tone;
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  onDismiss?: () => void;
  className?: string;
}) {
  const { box, icon: Icon } = tones[tone];

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("flex items-start gap-3 rounded-lg border px-4 py-3 text-sm", box, className)}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" stroke={2} />
      <div className="min-w-0 flex-1">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className={cn(!!title && "mt-0.5", "opacity-90")}>{children}</div>}
        {action && <div className="mt-2">{action}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="-m-1 rounded p-1 opacity-60 hover:opacity-100"
          aria-label="Dismiss"
        >
          <IconX className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
