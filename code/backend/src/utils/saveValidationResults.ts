import fs from "fs";
import path from "path";
import crypto from "crypto";
import { uploadFileToSeaweedFS } from "../lib/seaweedfs";
import { appendToSheet } from "../lib/googleSheets";
import { PhoneValidationResult } from "../types/phoneValidation";

export type PhoneType = "B2B" | "B2C";

interface SaveValidationParams {
  companyAbbr?: string;
  phoneType: PhoneType;
  results: PhoneValidationResult[];
}

interface SaveValidationResult {
  fileName: string;
  publicPath: string;
  seaweedfsUploaded: boolean;
  seaweedfsError?: string;
}

// Local copy of every results file; matches the ./code/backend/uploads volume in docker-compose.
export const LOCAL_UPLOADS_DIR = path.join(process.cwd(), "uploads");

export const SHEET_MAP: Record<string, string> = {
  B2B_VALID: "1JTpQ9Z2seYQya6QPHaR5nQxTn75doFQj3CQ5NqtQEMg",
  B2B_INVALID: "1DNg5h2GH8UMlFotASFpbzRIrQ0NuoagIix-I57qdfCw",
  B2C_VALID: "1QqIb2J93wa5MfNCuS9bh1CXzRdpn-fGqRGa0BOTqkbo",
  B2C_INVALID: "1mbw4KQ2Y3T6rpSqZHtptaMKJZV6HmT5fr2OZykw_qok",
};

const SHEET_RANGE = "Sheet1!A:H";
const TIME_ZONE = "America/New_York";

function formatTimestamp(iso?: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-US", { timeZone: TIME_ZONE });
}

function statusLabel(r: PhoneValidationResult): string {
  if (r.isValid) return "Yes";
  return r.status === "UNKNOWN" ? "Unknown" : "No";
}

function toRow(r: PhoneValidationResult): string[] {
  return [
    r.phoneNumber,
    statusLabel(r),
    r.isReachable ? "Yes" : "No",
    r.countryCode || "",
    r.formattedNumber || "",
    r.nationalFormat || "",
    r.isValid ? r.formattedNumber || "" : "",
    formatTimestamp(r.validatedAt),
  ];
}

function escapeCsv(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

async function appendIfConfigured(key: string, values: string[][]) {
  const spreadsheetId = SHEET_MAP[key];
  if (!spreadsheetId || !values.length) return;
  await appendToSheet({ spreadsheetId, range: SHEET_RANGE, values });
}

async function storeToGoogleSheets(
  phoneType: PhoneType,
  results: PhoneValidationResult[]
) {
  const valid: string[][] = [];
  const invalid: string[][] = [];
  const master: string[][] = [];

  for (const r of results) {
    const row = toRow(r);
    master.push(row);
    if (r.isValid) valid.push(row);
    // Numbers we could not check are not known to be invalid, keep them out of that sheet.
    else if (r.status !== "UNKNOWN") invalid.push(row);
  }

  await appendIfConfigured(`${phoneType}_VALID`, valid);
  await appendIfConfigured(`${phoneType}_INVALID`, invalid);
  await appendIfConfigured(`${phoneType}_MASTER`, master);
}

function buildFileName(companyAbbr: string): { fileName: string; year: string; month: string } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value])
  );

  // Random suffix keeps two runs in the same minute from overwriting each other
  // and makes object keys impossible to guess.
  const suffix = crypto.randomBytes(4).toString("hex");
  const fileName = `${companyAbbr}${parts.day}${parts.month}${parts.year.slice(-2)}${parts.hour}${parts.minute}-${suffix}.csv`;

  return { fileName, year: parts.year, month: parts.month };
}

export async function saveValidationResults({
  companyAbbr = "VNC",
  phoneType,
  results,
}: SaveValidationParams): Promise<SaveValidationResult> {
  if (!results?.length) throw new Error("No validation results provided");

  const { fileName, year, month } = buildFileName(companyAbbr);
  const publicPath = `csvs/${year}/${month}/${fileName}`;

  const headers = [
    phoneType,
    "Valid",
    "Is Reachable",
    "Country Code",
    "E.164",
    "National Format",
    "Cleaned",
    "Validated At",
  ];
  const csvContent = [headers, ...results.map(toRow)]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\n");

  try {
    await storeToGoogleSheets(phoneType, results);
  } catch (error) {
    console.error("Failed to store results in Google Sheets:", error);
  }

  const localPath = path.join(LOCAL_UPLOADS_DIR, publicPath);
  try {
    fs.mkdirSync(path.dirname(localPath), { recursive: true });
    fs.writeFileSync(localPath, csvContent, "utf8");
  } catch (error) {
    console.error("Failed to write local results file:", error);
  }

  let seaweedfsUploaded = false;
  let seaweedfsError: string | undefined;

  try {
    await uploadFileToSeaweedFS(publicPath, Buffer.from(csvContent, "utf8"));
    seaweedfsUploaded = true;
  } catch (error) {
    seaweedfsError = error instanceof Error ? error.message : String(error);
    console.error("Failed to upload results to SeaweedFS:", {
      error: seaweedfsError,
      filePath: publicPath,
    });
  }

  return { fileName, publicPath, seaweedfsUploaded, seaweedfsError };
}
