import { useState } from "react";
import { IconUpload } from "@tabler/icons-react";
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
  downloadResults,
}: CsvValidationProps) {
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const validateCSV = async () => {
    if (!csvFile) return setError("Please select a CSV file");

    setLoading(true);
    setError(null);
    try {
      const response = await api.validateCSV(csvFile);
      setCsvResult(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to validate CSV file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
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
          className="mt-4 w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Processing..." : "Validate CSV"}
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
