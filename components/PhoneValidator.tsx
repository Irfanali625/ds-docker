'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { PhoneValidationResult, PhoneValidationStatus, BulkValidationResult } from '@/types/phoneValidation';
import { IconUpload, IconCheck, IconX, IconLoader } from '@tabler/icons-react';

export function PhoneValidator() {
  const [activeTab, setActiveTab] = useState<'single' | 'bulk' | 'csv'>('single');
  const [singlePhone, setSinglePhone] = useState('');
  const [singleResult, setSingleResult] = useState<PhoneValidationResult | null>(null);
  const [bulkPhones, setBulkPhones] = useState('');
  const [bulkResult, setBulkResult] = useState<BulkValidationResult | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvResult, setCsvResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateSingle = async () => {
    if (!singlePhone.trim()) {
      setError('Please enter a phone number');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await api.validatePhoneNumber(singlePhone);
      setSingleResult(result);
    } catch (err: any) {
      setError(err.message || 'Failed to validate phone number');
    } finally {
      setLoading(false);
    }
  };

  const validateBulk = async () => {
    const phones = bulkPhones
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    if (phones.length === 0) {
      setError('Please enter at least one phone number');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await api.validateBulkPhoneNumbers(phones);
      setBulkResult(result);
    } catch (err: any) {
      setError(err.message || 'Failed to validate phone numbers');
    } finally {
      setLoading(false);
    }
  };

  const validateCSV = async () => {
    if (!csvFile) {
      setError('Please select a CSV file');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await api.validateCSV(csvFile);
      setCsvResult(result);
    } catch (err: any) {
      setError(err.message || 'Failed to validate CSV file');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: PhoneValidationStatus) => {
    switch (status) {
      case PhoneValidationStatus.VALID:
      case PhoneValidationStatus.MOBILE:
      case PhoneValidationStatus.SMS_ENABLED:
        return 'bg-green-100 text-green-800';
      case PhoneValidationStatus.LANDLINE:
        return 'bg-blue-100 text-blue-800';
      case PhoneValidationStatus.VOICE_ENABLED:
        return 'bg-purple-100 text-purple-800';
      case PhoneValidationStatus.INVALID:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusLabel = (status: PhoneValidationStatus, lineType?: string) => {
    if (lineType === 'LANDLINE' || status === PhoneValidationStatus.LANDLINE) {
      return 'LANDLINE (Fixed Line)';
    }
    if (lineType === 'VOIP') {
      return 'VOIP';
    }
    return status;
  };

  const downloadResults = () => {
    if (!bulkResult && !csvResult) return;

    const data = csvResult?.csvResults || bulkResult?.results || [];
    const csv = [
      ['Phone Number', 'Valid', 'Is Reachable', 'Country Code', 'E.164', 'National Format', 'Validated At'],
      ...data.map((item: any) => {
        const result = item.validation || item;
        return [
          result.phoneNumber,
          result.isValid ? 'Yes' : 'No',
          typeof result.isReachable !== 'undefined' ? (result.isReachable ? 'Yes' : 'No') : '',
          result.countryCode || '',
          result.formattedNumber || '',
          result.nationalFormat || '',
          result.validatedAt ? new Date(result.validatedAt).toLocaleString() : ''
        ];
      })
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phone-validation-results-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Phone Number Validator</h2>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {(['single', 'bulk', 'csv'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'csv' ? 'CSV Upload' : `${tab} Validation`}
            </button>
          ))}
        </nav>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Single Validation */}
      {activeTab === 'single' && (
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
                placeholder="+1234567890 or 1234567890"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                onClick={validateSingle}
                disabled={loading}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? <IconLoader className="w-5 h-5 animate-spin" /> : 'Validate'}
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
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${singleResult.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {singleResult.isValid ? <IconCheck className="w-4 h-4 inline" /> : <IconX className="w-4 h-4 inline" />}
                    {singleResult.isValid ? ' Yes' : ' No'}
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
                    <p className="font-semibold">{(singleResult as any).nationalFormat}</p>
                  </div>
                )}
                {singleResult.isValid && typeof (singleResult as any).isReachable !== 'undefined' && (
                  <div>
                    <span className="text-sm text-gray-500">Is Reachable:</span>
                    <p className="font-semibold">{(singleResult as any).isReachable ? 'Yes' : 'No'}</p>
                  </div>
                )}
                {singleResult.isValid && singleResult.validatedAt && (
                  <div className="col-span-2">
                    <span className="text-sm text-gray-500">Validated At:</span>
                    <p className="font-mono text-sm">{new Date(singleResult.validatedAt as any).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bulk Validation */}
      {activeTab === 'bulk' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Numbers (one per line, max 1000)
            </label>
            <textarea
              value={bulkPhones}
              onChange={(e) => setBulkPhones(e.target.value)}
              placeholder="+1234567890&#10;+1234567891&#10;+1234567892"
              rows={10}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
            />
            <button
              onClick={validateBulk}
              disabled={loading}
              className="mt-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Validating...' : 'Validate All'}
            </button>
          </div>

          {bulkResult && (
            <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-800">{bulkResult.total}</p>
                  <p className="text-sm text-gray-500">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{bulkResult.valid}</p>
                  <p className="text-sm text-gray-500">Valid</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{bulkResult.invalid}</p>
                  <p className="text-sm text-gray-500">Invalid</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{bulkResult.unknown}</p>
                  <p className="text-sm text-gray-500">Unknown</p>
                </div>
              </div>
              <button
                onClick={downloadResults}
                className="w-full mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Download Results as CSV
              </button>
            </div>
          )}
        </div>
      )}

      {/* CSV Validation */}
      {activeTab === 'csv' && (
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
              {loading ? 'Processing...' : 'Validate CSV'}
            </button>
          </div>

          {csvResult && (
            <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="font-semibold mb-4">Results Summary</h3>
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-800">{csvResult.summary.total}</p>
                  <p className="text-sm text-gray-500">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{csvResult.summary.valid}</p>
                  <p className="text-sm text-gray-500">Valid</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{csvResult.summary.invalid}</p>
                  <p className="text-sm text-gray-500">Invalid</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{csvResult.summary.unknown}</p>
                  <p className="text-sm text-gray-500">Unknown</p>
                </div>
              </div>
              <button
                onClick={downloadResults}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Download Results as CSV
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

