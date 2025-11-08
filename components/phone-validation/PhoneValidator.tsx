"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import {
  PhoneValidationResult,
  BulkValidationResult,
} from "@/types/phoneValidation";
import { Tabs } from "./Tabs";
import { SingleValidation } from "./SingleValidation";
import { BulkValidation } from "./BulkValidation";
import { CsvValidation } from "./CsvValidation";
import { downloadResults } from "@/helpers/helpers";
import { UpgradeModal } from "@/components/subscription/UpgradeModal";
import { subscriptionApi } from "@/lib/api";


interface PhoneValidatorProps {
  onUpgrade?: () => void;
}

export function PhoneValidator({ onUpgrade }: PhoneValidatorProps) {
  const [activeTab, setActiveTab] = useState<"single" | "bulk" | "csv">("single");
  const [singleResult, setSingleResult] = useState<PhoneValidationResult[] | null>(null);
  const [bulkResult, setBulkResult] = useState<BulkValidationResult | null>(null);
  const [csvResult, setCsvResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [premiumPrice, setPremiumPrice] = useState(19);

  // Handle validation errors that require upgrade
  const handleValidationError = (err: any) => {
    if (err.message && err.message.includes("limit reached")) {
      setShowUpgradeModal(true);
    } else {
      setError(err.message || "Failed to validate");
    }
  };

  const handleUpgradeSuccess = () => {
    setShowUpgradeModal(false);
    if (onUpgrade) {
      onUpgrade();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Phone Number Validator</h2>

      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            {error.includes("limit") && (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
              >
                Upgrade Now
              </button>
            )}
          </div>
        </div>
      )}

      {activeTab === "single" && (
        <SingleValidation
          api={api}
          loading={loading}
          setLoading={setLoading}
          setError={(err) => {
            setError(err);
            if (err && err.includes && err.includes("limit")) {
              setShowUpgradeModal(true);
            }
          }}
          singleResult={singleResult}
          setSingleResult={setSingleResult}
        />
      )}

      {activeTab === "bulk" && (
        <BulkValidation
          api={api}
          loading={loading}
          setLoading={setLoading}
          setError={(err) => {
            setError(err);
            if (err && err.includes && err.includes("limit")) {
              setShowUpgradeModal(true);
            }
          }}
          bulkResult={bulkResult}
          setBulkResult={setBulkResult}
          downloadResults={downloadResults}
        />
      )}

      {activeTab === "csv" && (
        <CsvValidation
          api={api}
          loading={loading}
          setLoading={setLoading}
          setError={(err) => {
            setError(err);
            if (err && err.includes && err.includes("limit")) {
              setShowUpgradeModal(true);
            }
          }}
          csvResult={csvResult}
          setCsvResult={setCsvResult}
          downloadResults={downloadResults}
        />
      )}

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSuccess={handleUpgradeSuccess}
        premiumPrice={premiumPrice}
      />
    </div>
  );
}
