import { Badge } from "@/components/ui/Badge";
import { PhoneValidationResult, ValidationStatus } from "@/types/phoneValidation";

export function statusOf(result: PhoneValidationResult): ValidationStatus {
  if (result.isValid) return "VALID";
  return result.status === "UNKNOWN" ? "UNKNOWN" : "INVALID";
}

const config: Record<ValidationStatus, { label: string; tone: "success" | "danger" | "warning" }> = {
  VALID: { label: "Valid", tone: "success" },
  INVALID: { label: "Invalid", tone: "danger" },
  UNKNOWN: { label: "Not checked", tone: "warning" },
};

export function StatusBadge({ result }: { result: PhoneValidationResult }) {
  const { label, tone } = config[statusOf(result)];
  return (
    <Badge tone={tone} dot>
      {label}
    </Badge>
  );
}

export function formatDateTime(iso?: string) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
