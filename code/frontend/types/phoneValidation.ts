export type PhoneType = 'B2B' | 'B2C';
export type ValidationMode = 'single' | 'bulk' | 'csv';
export type ValidationStatus = 'VALID' | 'INVALID' | 'UNKNOWN';

export interface PhoneValidationResult {
  phoneNumber: string;
  isValid: boolean;
  status?: ValidationStatus;
  isReachable?: boolean;
  countryCode?: string;
  formattedNumber?: string;
  nationalFormat?: string;
  error?: string;
  validatedAt?: string;
}

export interface ValidationRun {
  historyId: string;
  type: ValidationMode;
  phoneType: PhoneType;
  total: number;
  valid: number;
  invalid: number;
  unknown: number;
  duplicatesRemoved?: number;
  rowsSkipped?: number;
  results: PhoneValidationResult[];
  processedAt: string;
  storageWarning?: string;
}

export interface HistoryEntry {
  id: string;
  phoneType: PhoneType;
  type: ValidationMode;
  filePath: string;
  total: number;
  valid?: number;
  invalid?: number;
  unknown?: number;
  createdAt: string;
}

export const MAX_BULK_NUMBERS = 1000;
export const MAX_CSV_ROWS = 10000;
export const MAX_CSV_BYTES = 10 * 1024 * 1024;
