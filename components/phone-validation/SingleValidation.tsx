import { useState } from "react";
import { IconLoader, IconCheck, IconX } from "@tabler/icons-react";
import { PhoneValidationResult } from "@/types/phoneValidation";

interface SingleValidationProps {
  api: any;
  loading: boolean;
  setLoading: (v: boolean) => void;
  setError: (v: string | null) => void;
  singleResult: PhoneValidationResult | null;
  setSingleResult: (r: PhoneValidationResult | null) => void;
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
    if (!singlePhone.trim()) return setError("Please enter a phone number");

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

  return (
    <div className="space-y-4">
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

      {singleResult && (
        <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-500">Phone:</span>
              <p className="font-semibold">{singleResult.phoneNumber}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Valid:</span>
              <span
                className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                  singleResult.isValid
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {singleResult.isValid ? (
                  <IconCheck className="w-4 h-4 inline" />
                ) : (
                  <IconX className="w-4 h-4 inline" />
                )}
                {singleResult.isValid ? " Yes" : " No"}
              </span>
            </div>
            {singleResult.isValid && singleResult.countryCode && (
              <div>
                <span className="text-sm text-gray-500">Country Code:</span>
                <p className="font-semibold">{singleResult.countryCode}</p>
              </div>
            )}
            {singleResult.isValid && singleResult.formattedNumber && (
              <div>
                <span className="text-sm text-gray-500">E.164:</span>
                <p className="font-semibold">{singleResult.formattedNumber}</p>
              </div>
            )}
            {singleResult.isValid && (singleResult as any).nationalFormat && (
              <div>
                <span className="text-sm text-gray-500">National Format:</span>
                <p className="font-semibold">
                  {(singleResult as any).nationalFormat}
                </p>
              </div>
            )}
            {singleResult.isValid &&
              typeof (singleResult as any).isReachable !== "undefined" && (
                <div>
                  <span className="text-sm text-gray-500">Is Reachable:</span>
                  <p className="font-semibold">
                    {(singleResult as any).isReachable ? "Yes" : "No"}
                  </p>
                </div>
              )}
            {singleResult.isValid && singleResult.validatedAt && (
              <div className="col-span-2">
                <span className="text-sm text-gray-500">Validated At:</span>
                <p className="font-mono text-sm">
                  {new Date(singleResult.validatedAt as any).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
