import { getAuthToken } from "./auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

export const api = {
  // Phone Validation APIs
  async validatePhoneNumber(
    phoneNumber: string
  ): Promise<import("@/types/phoneValidation").PhoneValidationResult> {
    const response = await fetch(
      `${API_BASE_URL}/api/phone-validation/single`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ phoneNumber }),
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to validate phone number");
    }
    return response.json();
  },

  async validateBulkPhoneNumbers(
    phoneNumbers: string[]
  ): Promise<import("@/types/phoneValidation").BulkValidationResult> {
    const response = await fetch(`${API_BASE_URL}/api/phone-validation/bulk`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ phoneNumbers }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to validate phone numbers");
    }
    return response.json();
  },

  async validateCSV(file: File): Promise<any> {
    const formData = new FormData();
    formData.append("csvFile", file);

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/phone-validation/csv`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to validate CSV file");
    }
    return response.json();
  },

    async getHistory(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/api/phone-validation/history`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch user leads: ${response.statusText}`);
    }
    return response.json();
  },
};
