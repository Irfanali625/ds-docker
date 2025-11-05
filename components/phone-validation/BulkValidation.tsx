import { useState } from "react";
import { BulkValidationResult } from "@/types/phoneValidation";
import { ValidationSummary } from "./ValidationSummary";

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
  downloadResults,
}: BulkValidationProps) {
  const [bulkPhones, setBulkPhones] = useState("");

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
      const response = await api.validateBulkPhoneNumbers(phones);
      setBulkResult(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to validate phone numbers");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
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
          className="mt-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Validating..." : "Validate All"}
        </button>
      </div>

      {bulkResult && (
        <ValidationSummary
          total={bulkResult.total}
          results={bulkResult.result}
          onDownload={() => downloadResults(bulkResult.result)}
        />
      )}
    </div>
  );
}
