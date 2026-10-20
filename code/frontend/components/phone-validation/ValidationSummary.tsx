import { getDownloadUrl } from "@/utils/getUrls";
import { IconDownload } from "@tabler/icons-react";

interface ValidationResult {
  phoneNumber: string;
  isValid?: boolean;
  isReachable?: boolean;
  countryCode?: string;
  formattedNumber?: string;
  nationalFormat?: string;
  validatedAt?: string;
}

interface ValidationSummaryProps {
  total: number;
  results: ValidationResult[];
  filePath: string;
}

export function ValidationSummary({
  total,
  results,
  filePath,
}: ValidationSummaryProps) {
  if (total === 0) {
    return (
      <p className="text-gray-500 text-center mt-4">No results to display</p>
    );
  }

  const validCount = results.filter((r) => r.isValid).length;
  const invalidCount = results.filter((r) => r.isValid === false).length;
  const unknownCount = total - validCount - invalidCount;

  return (
    <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50 transition-opacity duration-300 opacity-100">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <Stat label="Total" value={total} color="text-gray-800" />
        <Stat label="Valid" value={validCount} color="text-green-600" />
        <Stat label="Invalid" value={invalidCount} color="text-red-600" />
        <Stat label="Unknown" value={unknownCount} color="text-yellow-600" />
      </div>
      <div className="flex justify-end">
        <a
          href={getDownloadUrl(filePath)}
          className="flex items-center gap-2 mt-4 px-4 text-xs py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Download Result as CSV
          <IconDownload />
        </a>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}
