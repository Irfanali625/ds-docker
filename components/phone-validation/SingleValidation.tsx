import { useState } from "react";
import { IconLoader, IconCheck, IconX } from "@tabler/icons-react";
import { PhoneValidationResult } from "@/types/phoneValidation";
import { ValidationSummary } from "./ValidationSummary";
import { downloadResults } from "@/helpers/helpers";

interface SingleValidationProps {
  api: any;
  loading: boolean;
  setLoading: (v: boolean) => void;
  setError: (v: string | null) => void;
  singleResult: PhoneValidationResult[] | null;
  setSingleResult: (r: PhoneValidationResult[] | null) => void;
}

export function SingleValidation({
  api,
  loading,
  setLoading,
  setError,
  singleResult,
  setSingleResult,
}: SingleValidationProps) {
  const [singlePhone, setSinglePhone] = useState("");

  const validateSingle = async () => {
    if (!singlePhone.trim()) {
      setError("Please enter a phone number");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await api.validatePhoneNumber(singlePhone);
      setSingleResult(result);
    } catch (err: any) {
      setError(err.message || "Failed to validate phone number");
    } finally {
      setLoading(false);
    }
  };

  const result = singleResult?.[0];

  const InfoRow = ({
    label,
    value,
  }: {
    label: string;
    value: string | number | boolean | undefined;
  }) => {
    if (value === undefined || value === null || value === "") return null;
    return (
      <div>
        <span className="text-sm text-gray-500">{label}:</span>
        <p className="font-semibold break-all">{String(value)}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Input section */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Phone Number
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={singlePhone}
            onChange={(e) => setSinglePhone(e.target.value)}
            placeholder="+61293744000 or 61293744000"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            onClick={validateSingle}
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <IconLoader className="w-5 h-5 animate-spin" />
            ) : (
              "Validate"
            )}
          </button>
        </div>
      </div>

      {/* Result section */}
      {result && (
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
          <div className="grid sm:grid-cols-2 gap-4">
            <InfoRow label="Phone" value={result.phoneNumber} />
            <div>
              <span className="text-sm text-gray-500">Valid:</span>
              <span
                className={`ml-2 px-2 py-1 rounded text-xs font-semibold inline-flex items-center gap-1 ${
                  result.isValid
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {result.isValid ? (
                  <IconCheck className="w-4 h-4" />
                ) : (
                  <IconX className="w-4 h-4" />
                )}
                {result.isValid ? "Yes" : "No"}
              </span>
            </div>

            {result.isValid && (
              <>
                <InfoRow label="Country Code" value={result.countryCode} />
                <InfoRow label="E.164 Format" value={result.formattedNumber} />
                <InfoRow
                  label="National Format"
                  value={(result as any).nationalFormat}
                />
                <InfoRow
                  label="Reachable"
                  value={
                    typeof (result as any).isReachable !== "undefined"
                      ? (result as any).isReachable
                        ? "Yes"
                        : "No"
                      : undefined
                  }
                />
                <InfoRow
                  label="Validated At"
                  value={
                    result.validatedAt
                      ? new Date(result.validatedAt).toLocaleString()
                      : undefined
                  }
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* Summary section */}
      {singleResult && (
        <ValidationSummary
          total={1}
          results={singleResult}
          onDownload={() => downloadResults(singleResult)}
        />
      )}
    </div>
  );
}
