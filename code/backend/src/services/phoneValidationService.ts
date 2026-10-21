import twilio from "twilio";
import {
  PhoneValidationResult,
  PhoneValidationStatus,
  ValidationProvider,
} from "../types/phoneValidation";

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;

const twilioClient =
  TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN
    ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    : null;

if (!twilioClient) {
  console.warn(
    "TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN not set. Phone lookups will return UNKNOWN."
  );
}

const BATCH_SIZE = 10;
const BATCH_DELAY_MS = 500;

/**
 * Returns digits only (no leading +). Numbers without a country code that look
 * like 10-digit NANP numbers are prefixed with 1.
 */
export function normalizePhoneNumber(phone: string): string {
  const trimmed = String(phone ?? "").trim();
  const hasPlus = trimmed.startsWith("+");
  let digits = trimmed.replace(/\D/g, "");

  if (hasPlus) return digits;

  if (digits.startsWith("00")) return digits.substring(2);
  if (digits.startsWith("0")) digits = digits.substring(1);

  if (digits.length === 10 && !digits.startsWith("1")) {
    return `1${digits}`;
  }

  return digits;
}

/** True when the input contains enough digits to be worth a paid lookup. */
export function looksLikePhoneNumber(value: string): boolean {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

function result(
  phoneNumber: string,
  status: PhoneValidationStatus,
  extra: Partial<PhoneValidationResult> = {}
): PhoneValidationResult {
  return {
    phoneNumber,
    isValid: status === PhoneValidationStatus.VALID,
    status,
    provider: ValidationProvider.TWILIO,
    validatedAt: new Date().toISOString(),
    ...extra,
  };
}

/**
 * Looks a number up with Twilio. Never throws: lookups that could not be
 * completed come back with status UNKNOWN and an `error`, so callers can tell
 * "Twilio says invalid" apart from "we could not check".
 */
export async function validatePhoneNumber(
  phoneNumber: string
): Promise<PhoneValidationResult> {
  const normalized = normalizePhoneNumber(phoneNumber);

  if (!looksLikePhoneNumber(normalized)) {
    return result(normalized || String(phoneNumber ?? ""), PhoneValidationStatus.INVALID, {
      error: "Not a phone number",
    });
  }

  if (!twilioClient) {
    return result(normalized, PhoneValidationStatus.UNKNOWN, {
      error: "Lookup provider not configured",
    });
  }

  try {
    const lookup: any = await twilioClient.lookups.v2
      .phoneNumbers(`+${normalized}`)
      .fetch();

    if (!lookup?.valid) {
      return result(normalized, PhoneValidationStatus.INVALID, {
        countryCode: lookup?.countryCode,
      });
    }

    return result(normalized, PhoneValidationStatus.VALID, {
      countryCode: lookup.countryCode,
      formattedNumber: lookup.phoneNumber || `+${normalized}`,
      nationalFormat: lookup.nationalFormat,
      isReachable: true,
    });
  } catch (error: any) {
    if (error?.code === 20404 || error?.status === 404) {
      return result(normalized, PhoneValidationStatus.INVALID);
    }

    console.error("Twilio lookup error:", error?.message);
    return result(normalized, PhoneValidationStatus.UNKNOWN, {
      error: error?.status === 429 ? "Rate limited" : "Lookup failed",
    });
  }
}

export async function validateBulkPhoneNumbers(
  phoneNumbers: string[]
): Promise<PhoneValidationResult[]> {
  const results: PhoneValidationResult[] = [];

  for (let i = 0; i < phoneNumbers.length; i += BATCH_SIZE) {
    const batch = phoneNumbers.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(batch.map(validatePhoneNumber));
    results.push(...batchResults);

    if (i + BATCH_SIZE < phoneNumbers.length) {
      await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }

  return results;
}
