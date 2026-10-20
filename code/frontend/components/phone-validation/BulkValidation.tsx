import { useState } from "react";
import { IconLoader, IconChecklist } from "@tabler/icons-react";
import { BulkValidationResult } from "@/types/phoneValidation";
import { ValidationSummary } from "./ValidationSummary";
import { getDownloadUrl } from "@/utils/getUrls";

interface BulkValidationProps {
  api: any;
  loading: boolean;
  setLoading: (v: boolean) => void;
  setError: (v: string | null) => void;
  bulkResult: any | null;
  setBulkResult: (r: BulkValidationResult | null) => void;
  downloadResults: (data: any) => void;
}

export function BulkValidation({
  api,
  loading,
  setLoading,
  setError,
  bulkResult,
  setBulkResult,
}: BulkValidationProps) {
  const [bulkPhones, setBulkPhones] = useState("");
  const [phoneType, setPhoneType] = useState<"B2B" | "B2C">("B2B");

  const validateBulk = async () => {
    const phones = bulkPhones
      .split("\n")
      .map((p) => p.trim())
      .filter(Boolean);

    if (!phones.length)
      return setError("Please enter at least one phone number");

    setLoading(true);
    setError(null);
    try {
      const response = await api.validateBulkPhoneNumbers(phones, phoneType);
      setBulkResult(response.data);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to validate phone numbers";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="w-1/2">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Type
        </label>
        <select
          value={phoneType}
          onChange={(e) => setPhoneType(e.target.value as "B2B" | "B2C")}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="B2B">B2B</option>
          <option value="B2C">B2C</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Phone Numbers (one per line, max 1000)
        </label>
        <textarea
          value={bulkPhones}
          onChange={(e) => setBulkPhones(e.target.value)}
          rows={10}
          placeholder={`+14155552671
61293744000`}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
        />

        <button
          onClick={validateBulk}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {loading ? (
            <>
              <IconLoader className="w-4 h-4 animate-spin" stroke={2} />
              <span>Validating...</span>
            </>
          ) : (
            <>
              <IconChecklist className="w-4 h-4" stroke={2} />
              <span>Validate All</span>
            </>
          )}
        </button>
      </div>

      {bulkResult && (
        <ValidationSummary
          total={bulkResult.total}
          results={bulkResult.result}
          filePath={bulkResult.downloadUrl}
        />
      )}
    </div>
  );
}
