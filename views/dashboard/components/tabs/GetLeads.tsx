import React from 'react';
import { ContactType, Contact } from '@/types';
import { ContactCard } from '@/components/ContactCard';

interface GetLeadsProps {
  selectedType: ContactType | null;
  setSelectedType: (t: ContactType | null) => void;
  currentContact: Contact | null;
  fetchRandomContact: () => void;
  storeRecord: (id: string) => void;
  loading: boolean;
  error: string | null;
}

export function GetLeads({
  selectedType,
  setSelectedType,
  currentContact,
  fetchRandomContact,
  storeRecord,
  loading,
  error,
}: GetLeadsProps) {
  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Select Lead Type</h2>
        <div className="flex gap-4">
          {(['B2B', 'B2C'] as ContactType[]).map((type) => (
            <button
              key={type}
              onClick={() => {
                setSelectedType(type);
              }}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                selectedType === type
                  ? type === 'B2B'
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'bg-green-600 text-white shadow-lg transform scale-105'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {type} Leads
            </button>
          ))}
        </div>
      </div>

      {selectedType && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <button
            onClick={fetchRandomContact}
            disabled={loading}
            className="w-full py-3 px-6 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Loading...' : `Get Random ${selectedType} Contact`}
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {currentContact && <ContactCard contact={currentContact} onStore={storeRecord} canStore={!loading} />}
    </>
  );
}
