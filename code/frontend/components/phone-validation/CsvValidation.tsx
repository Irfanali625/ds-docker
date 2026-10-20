import { useState } from "react";
import { IconUpload, IconLoader, IconFileCheck } from "@tabler/icons-react";
import { ValidationSummary } from "./ValidationSummary";
import { getDownloadUrl } from "@/utils/getUrls";

interface CsvValidationProps {
  api: any;
  loading: boolean;
  setLoading: (v: boolean) => void;
  setError: (v: string | null) => void;
  csvResult: any;
  setCsvResult: (r: any) => void;
  downloadResults: (data: any) => void;
}

export function CsvValidation({
  api,
  loading,
  setLoading,
  setError,
  csvResult,
  setCsvResult,
}: CsvValidationProps) {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [phoneType, setPhoneType] = useState<"B2B" | "B2C">("B2B");

  const validateCSV = async () => {
    if (!csvFile) return setError("Please select a CSV file");

    setLoading(true);
    setError(null);
    try {
      const response = await api.validateCSV(csvFile, phoneType);
      setCsvResult(response.data);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to validate CSV file";
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
          Upload CSV File (max 10MB, max 10000 rows)
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload" className="cursor-pointer">
            <IconUpload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              Click to upload or drag and drop
            </p>
            {csvFile && (
              <p className="text-sm text-indigo-600 mt-2 font-medium">
                Selected: {csvFile.name}
              </p>
            )}
          </label>
        </div>
        <button
          onClick={validateCSV}
          disabled={loading || !csvFile}
          className="flex items-center justify-center gap-2 w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {loading ? (
            <>
              <IconLoader className="w-4 h-4 animate-spin" stroke={2} />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <IconFileCheck className="w-4 h-4" stroke={2} />
              <span>Validate CSV</span>
            </>
          )}
        </button>
      </div>

      {csvResult && (
        <ValidationSummary
          total={csvResult.total}
          results={csvResult.result}
          filePath={csvResult.downloadUrl}
        />
      )}
    </div>
  );
}
