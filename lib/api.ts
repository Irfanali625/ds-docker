import cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

console.log('API ULR', API_BASE_URL);


function getAuthHeaders(): HeadersInit {
  const token = cookies.get("auth_token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

export const api = {
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
      const error = await response
        .json()
        .catch(() => ({ error: "Failed to validate phone number" }));
      const err: any = new Error(
        error.error || error.message || "Failed to validate phone number"
      );
      err.response = response;
      err.requiresUpgrade = error.requiresUpgrade || false;
      err.limitType = error.limitType;
      throw err;
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
      const error = await response
        .json()
        .catch(() => ({ error: "Failed to validate phone numbers" }));
      const err: any = new Error(
        error.error || error.message || "Failed to validate phone numbers"
      );
      err.response = response;
      err.requiresUpgrade = error.requiresUpgrade || false;
      err.limitType = error.limitType;
      err.remainingFree = error.remainingFree;
      throw err;
    }
    return response.json();
  },

  async validateCSV(file: File): Promise<any> {
    const formData = new FormData();
    formData.append("csvFile", file);

    const token = cookies.get('auth_token');
    const response = await fetch(`${API_BASE_URL}/api/phone-validation/csv`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Failed to validate CSV file" }));
      const err: any = new Error(
        error.error || error.message || "Failed to validate CSV file"
      );
      err.response = response;
      err.requiresUpgrade = error.requiresUpgrade || false;
      err.limitType = error.limitType;
      err.remainingFree = error.remainingFree;
      throw err;
    }
    return response.json();
  },

  async getHistory(): Promise<any[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/phone-validation/history`,
      {
        headers: getAuthHeaders(),
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch user history: ${response.statusText}`);
    }
    return response.json();
  },
};

export const subscriptionApi = {
  async getStatus(): Promise<
    import("@/types/subscription").SubscriptionStatusResponse
  > {
    try {
      const response = await fetch(`${API_BASE_URL}/api/subscription/status`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ error: "Failed to fetch subscription status" }));
        const err: any = new Error(
          error.error ||
            error.message ||
            `Failed to fetch subscription status (${response.status})`
        );
        err.status = response.status;
        throw err;
      }
      return response.json();
    } catch (err: any) {
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        throw new Error(
          "Network error: Unable to connect to the server. Please check if the backend is running."
        );
      }
      throw err;
    }
  },

  async createCheckout(payload: {
    provider: "stripe" | "square";
    successUrl: string;
    cancelUrl?: string;
  }): Promise<{ provider: string; checkoutUrl: string; paymentId: string }> {
    const response = await fetch(`${API_BASE_URL}/api/subscription/checkout`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Failed to create checkout session" }));
      throw new Error(
        error.error || error.message || "Failed to create checkout session"
      );
    }

    return response.json();
  },

  async createSubscription(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/subscription/create`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create subscription");
    }
    return response.json();
  },

  async getHistory(): Promise<{ subscriptions: any[]; payments: any[] }> {
    const response = await fetch(`${API_BASE_URL}/api/subscription/history`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch subscription history");
    }
    return response.json();
  },
};
