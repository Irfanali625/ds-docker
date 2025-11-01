'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ContactCard } from '@/components/ContactCard';
import { LeadsTable } from '@/components/LeadsTable';
import { PhoneValidator } from '@/components/PhoneValidator';
import { ContactType, ContactPhase, Contact } from '@/types';
import { api } from '@/lib/api';

export function DashboardView() {
  const { user, logout } = useAuth();
  const [selectedType, setSelectedType] = useState<ContactType | null>(null);
  const [currentContact, setCurrentContact] = useState<Contact | null>(null);
  const [userContacts, setUserContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'get' | 'my-leads' | 'validator'>('get');

  const fetchRandomContact = async () => {
    if (!selectedType) return;

    setLoading(true);
    setError(null);
    try {
      const contact = await api.getRandomContact(selectedType, ContactPhase.CLEANED);
      setCurrentContact(contact);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch contact');
    } finally {
      setLoading(false);
    }
  };

  const storeRecord = async (contactId: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.storeRecord(contactId, ContactPhase.DELIVERED);
      if (currentContact?.id === contactId) {
        setCurrentContact({ ...currentContact, phase: ContactPhase.DELIVERED });
      }
      alert('Contact stored successfully!');
      loadUserContacts();
    } catch (err: any) {
      setError(err.message || 'Failed to store record');
    } finally {
      setLoading(false);
    }
  };

  const loadUserContacts = async () => {
    try {
      // Get only the contacts this user has stored (their leads)
      const contacts = await api.getUserLeads();
      setUserContacts(contacts);
    } catch (err: any) {
      console.error('Failed to load contacts:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'my-leads') {
      loadUserContacts();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800">Data Scraping Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-8">
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('get')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'get'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Get Leads
              </button>
              <button
                onClick={() => setActiveTab('my-leads')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'my-leads'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Leads ({userContacts.length})
              </button>
              <button
                onClick={() => setActiveTab('validator')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'validator'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Phone Validator
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'get' && (
          <>
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Select Lead Type</h2>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setSelectedType(ContactType.B2B);
                    setCurrentContact(null);
                  }}
                  className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                    selectedType === ContactType.B2B
                      ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  B2B Leads
                </button>
                <button
                  onClick={() => {
                    setSelectedType(ContactType.B2C);
                    setCurrentContact(null);
                  }}
                  className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                    selectedType === ContactType.B2C
                      ? 'bg-green-600 text-white shadow-lg transform scale-105'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  B2C Leads
                </button>
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

            {currentContact && (
              <ContactCard contact={currentContact} onStore={storeRecord} canStore={!loading} />
            )}
          </>
        )}

        {activeTab === 'my-leads' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">My Leads</h2>
            <LeadsTable contacts={userContacts} loading={loading} />
          </div>
        )}

        {activeTab === 'validator' && (
          <div>
            <PhoneValidator />
          </div>
        )}
      </main>
    </div>
  );
}

