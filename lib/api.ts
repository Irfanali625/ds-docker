import { Contact, ContactType, ContactPhase, UserRecord } from '@/types';
import { getAuthToken } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
}

export const api = {
  async getRandomContact(type: ContactType, phase: ContactPhase = ContactPhase.CLEANED): Promise<Contact> {
    const response = await fetch(`${API_BASE_URL}/api/contacts/random?type=${type}&phase=${phase}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch contact: ${response.statusText}`);
    }
    return response.json();
  },

  async storeRecord(contactId: string, phase: ContactPhase = ContactPhase.DELIVERED): Promise<UserRecord> {
    const response = await fetch(`${API_BASE_URL}/api/contacts/records`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ contactId, phase }),
    });
    if (!response.ok) {
      throw new Error(`Failed to store record: ${response.statusText}`);
    }
    return response.json();
  },

  async getUserRecords(): Promise<UserRecord[]> {
    const response = await fetch(`${API_BASE_URL}/api/contacts/records/my`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch user records: ${response.statusText}`);
    }
    return response.json();
  },

  async getUserLeads(): Promise<Contact[]> {
    const response = await fetch(`${API_BASE_URL}/api/contacts/my-leads`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch user leads: ${response.statusText}`);
    }
    return response.json();
  },

  async getContacts(type?: ContactType, phase?: ContactPhase, limit = 100, offset = 0): Promise<Contact[]> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (phase) params.append('phase', phase);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const response = await fetch(`${API_BASE_URL}/api/contacts?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch contacts: ${response.statusText}`);
    }
    return response.json();
  },

  // Phone Validation APIs
  async validatePhoneNumber(phoneNumber: string): Promise<import('@/types/phoneValidation').PhoneValidationResult> {
    const response = await fetch(`${API_BASE_URL}/api/phone-validation/single`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ phoneNumber }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to validate phone number');
    }
    return response.json();
  },

  async validateBulkPhoneNumbers(phoneNumbers: string[]): Promise<import('@/types/phoneValidation').BulkValidationResult> {
    const response = await fetch(`${API_BASE_URL}/api/phone-validation/bulk`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ phoneNumbers }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to validate phone numbers');
    }
    return response.json();
  },

  async validateCSV(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('csvFile', file);
    
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/phone-validation/csv`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to validate CSV file');
    }
    return response.json();
  },
};
