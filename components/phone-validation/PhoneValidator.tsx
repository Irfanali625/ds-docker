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


export function PhoneValidator() {
  const [activeTab, setActiveTab] = useState<"single" | "bulk" | "csv">("single");
  const [singleResult, setSingleResult] = useState<PhoneValidationResult[] | null>(null);
  const [bulkResult, setBulkResult] = useState<BulkValidationResult | null>(null);
  const [csvResult, setCsvResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Phone Number Validator</h2>

      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {activeTab === "single" && (
        <SingleValidation
          api={api}
          loading={loading}
          setLoading={setLoading}
          setError={setError}
          singleResult={singleResult}
          setSingleResult={setSingleResult}
        />
      )}

      {activeTab === "bulk" && (
        <BulkValidation
          api={api}
          loading={loading}
          setLoading={setLoading}
          setError={setError}
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
          setError={setError}
          csvResult={csvResult}
          setCsvResult={setCsvResult}
          downloadResults={downloadResults}
        />
      )}
    </div>
  );
}
