import cookies from "js-cookie";
import { User } from "@/types";
import { HistoryEntry, PhoneType, ValidationRun } from "@/types/phoneValidation";
import {
  SubscriptionStatusResponse,
  Subscription,
  Payment,
} from "@/types/subscription";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export const AUTH_COOKIE = "auth_token";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data: Record<string, any> = {}
  ) {
    super(message);
  }

  get requiresUpgrade(): boolean {
    return !!this.data.requiresUpgrade;
  }
}

let unauthorizedHandler: (() => void) | null = null;

/** Called whenever an authenticated request comes back 401 (expired or revoked session). */
export function onUnauthorized(handler: () => void) {
  unauthorizedHandler = handler;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
  fallbackError?: string;
}

async function send(path: string, { method = "GET", body, auth = true }: RequestOptions) {
  const headers: Record<string, string> = {};
  const token = cookies.get(AUTH_COOKIE);
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let payload: BodyInit | undefined;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  try {
    return await fetch(`${API_BASE_URL}${path}`, { method, headers, body: payload });
  } catch {
    throw new ApiError("Unable to reach the server. Check your connection and try again.", 0);
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, fallbackError = "Something went wrong. Please try again." } = options;
  const response = await send(path, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && auth) unauthorizedHandler?.();
    throw new ApiError(data.error || data.message || fallbackError, response.status, data);
  }

  return data as T;
}

function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function fileNameFrom(response: Response, fallback: string) {
  const header = response.headers.get("Content-Disposition") || "";
  return header.match(/filename="?([^"]+)"?/)?.[1] || fallback;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authApi = {
  login: (email: string, password: string) =>
    request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
      fallbackError: "Sign in failed",
    }),

  register: (name: string, email: string, password: string) =>
    request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: { name, email, password },
      auth: false,
      fallbackError: "Could not create your account",
    }),

  me: () => request<User>("/api/auth/me"),

  updateProfile: (payload: {
    name: string;
    email: string;
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }) =>
    request<{ message: string; token: string; user: User }>("/api/auth/profile/update", {
      method: "POST",
      body: payload,
      fallbackError: "Could not update your profile",
    }),
};

export const validationApi = {
  async single(phoneNumber: string, phoneType: PhoneType) {
    const res = await request<{ data: ValidationRun }>("/api/phone-validation/single", {
      method: "POST",
      body: { phoneNumber, phoneType },
      fallbackError: "Could not validate this number",
    });
    return res.data;
  },

  async bulk(phoneNumbers: string[], phoneType: PhoneType) {
    const res = await request<{ data: ValidationRun }>("/api/phone-validation/bulk", {
      method: "POST",
      body: { phoneNumbers, phoneType },
      fallbackError: "Could not validate these numbers",
    });
    return res.data;
  },

  async csv(file: File, phoneType: PhoneType) {
    const form = new FormData();
    form.append("phoneType", phoneType);
    form.append("csvFile", file);
    const res = await request<{ data: ValidationRun }>("/api/phone-validation/csv", {
      method: "POST",
      body: form,
      fallbackError: "Could not process this file",
    });
    return res.data;
  },

  history: () =>
    request<HistoryEntry[]>("/api/phone-validation/history", {
      fallbackError: "Could not load your history",
    }),

  /** Downloads a results file. Goes through fetch so the auth header is sent. */
  async download(historyId: string) {
    const response = await send(`/api/phone-validation/history/${historyId}/download`, {});
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) unauthorizedHandler?.();
      throw new ApiError(data.error || "Download failed", response.status, data);
    }
    saveBlob(await response.blob(), fileNameFrom(response, "results.csv"));
  },
};

export const subscriptionApi = {
  getStatus: () =>
    request<SubscriptionStatusResponse>("/api/subscription/status", {
      fallbackError: "Could not load subscription status",
    }),

  createCheckout: (payload: {
    provider: "stripe" | "square";
    successUrl: string;
    cancelUrl?: string;
  }) =>
    request<{ provider: string; checkoutUrl: string; paymentId: string }>(
      "/api/subscription/checkout",
      { method: "POST", body: payload, fallbackError: "Could not start checkout" }
    ),

  getHistory: () =>
    request<{ subscriptions: Subscription[]; payments: Payment[] }>(
      "/api/subscription/history",
      { fallbackError: "Could not load billing history" }
    ),
};
