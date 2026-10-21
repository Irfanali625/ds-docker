import {
  getSheetData,
  appendToSheet,
  deleteRows,
  getSheetMetadata,
} from "../lib/googleSheets";
import { sleep } from "../utils/sleep";
import { validatePhoneNumber } from "./phoneValidationService";
import { PhoneValidationStatus } from "../types/phoneValidation";

const CONFIG = {
  B2B: {
    unclean: "1Fn1PiTEPft_FXvVjw1K9uQ-pK8khMiwk-nGP9Y3cnT8",
    cleaned: "1a9pOvHfzbUw11GKLwuykfSBDc4AMWfvdgYc3VAm7-OY",
  },
  B2C: {
    unclean: "14rDA6fSGMc89Bla3vZj8zF6B-IjbcgLoCnaJqBT600A",
    cleaned: "1lZIdz0QLXf_W5fKWWtZEn6AwROyEfrBD5fviaQqnRUI",
  },
};

const BATCH_SIZE = 50;

/* -------------------------------- HELPERS -------------------------------- */

function findPhoneColumnIndex(headers: string[]): number {
  const phoneKeywords = [
    "phone",
    "phone number",
    "mobile",
    "contact",
    "cell",
    "tel",
  ];
  return headers.findIndex(
    (h) =>
      typeof h === "string" &&
      phoneKeywords.some((k) => h.toLowerCase().includes(k))
  );
}

async function getSheetId(
  spreadsheetId: string,
  title: string
): Promise<number | null> {
  const metadata = await getSheetMetadata(spreadsheetId);
  const sheet = metadata.sheets?.find(
    (s: any) => s.properties?.title === title
  );
  return sheet?.properties?.sheetId ?? null;
}

async function getAllSheetNames(spreadsheetId: string): Promise<string[]> {
  const metadata = await getSheetMetadata(spreadsheetId);
  return (
    (metadata.sheets
      ?.map((s) => s.properties?.title)
      .filter(Boolean) as string[]) || []
  );
}

/* -------------------------- CORE PER-SHEET LOGIC -------------------------- */

async function processSingleSheet(type: "B2B" | "B2C", sheetName: string) {
  const { unclean, cleaned } = CONFIG[type];

  console.log(`➡ Processing ${type} → ${sheetName}`);

  /* -------- Headers -------- */

  const uncleanHeaders = (await getSheetData(unclean, `${sheetName}!A1:Z1`))[0];


  if (!uncleanHeaders || uncleanHeaders.length === 0) {
    console.log(`⚠ No headers in ${sheetName}, skipping`);
    return;
  }

  const phoneColIndex = findPhoneColumnIndex(uncleanHeaders);
  if (phoneColIndex === -1) {
    console.log(`⚠ No phone column in ${sheetName}, skipping`);
    return;
  }

  await ensureCleanedHeaders(cleaned, uncleanHeaders);

  /* -------- Existing cleaned phones -------- */

  // Resolve the actual first tab name of the cleaned sheet (not assumed "Sheet1")
  const cleanedSheetNames = await getAllSheetNames(cleaned);
  const cleanedSheetName = cleanedSheetNames[0] || "Sheet1";

  const cleanedHeaders = (await getSheetData(cleaned, `${cleanedSheetName}!A1:Z1`))[0];

  const cleanedPhoneColIndex = findPhoneColumnIndex(
    cleanedHeaders || uncleanHeaders
  );

  const cleanedData = await getSheetData(cleaned, `${cleanedSheetName}!A2:Z`);
  const existingPhones = new Set<string>();

  cleanedData.forEach((row) => {
    const p = row[cleanedPhoneColIndex];
    if (p) existingPhones.add(String(p).replace(/\D/g, ""));
  });

  /* -------- Fetch batch -------- */

  const range = `${sheetName}!A2:Z${BATCH_SIZE + 1}`;
  const rowsToProcess = await getSheetData(unclean, range);

  if (!rowsToProcess || rowsToProcess.length === 0) {
    console.log(`ℹ No data in ${sheetName}`);
    return;
  }

  console.log(`   Processing ${rowsToProcess.length} rows`);

  /* -------- Validate & dedupe -------- */

  // Rows are consumed from the top of the sheet in order. `consumedRows` is how
  // many leading rows were fully handled (moved, duplicate, invalid or empty) and
  // can be deleted. When a lookup cannot be completed (Twilio down, rate limited)
  // we stop, so that row and everything after it stays for the next run.
  const validRowsToAppend: any[][] = [];
  let consumedRows = 0;

  for (const row of rowsToProcess) {
    const rawPhone = row[phoneColIndex];

    if (!rawPhone) {
      consumedRows++;
      continue;
    }

    const validation = await validatePhoneNumber(String(rawPhone));

    if (validation.status === PhoneValidationStatus.UNKNOWN) {
      console.log(
        `   Lookup unavailable for ${rawPhone} (${validation.error}), stopping batch`
      );
      break;
    }

    consumedRows++;

    if (validation.isValid && !existingPhones.has(validation.phoneNumber)) {
      const newRow = [...row];
      newRow[phoneColIndex] =
        validation.formattedNumber || validation.phoneNumber;

      validRowsToAppend.push(newRow);
      existingPhones.add(validation.phoneNumber);
    }

    await sleep(5000);
  }

  /* -------- Append -------- */

  if (validRowsToAppend.length > 0) {
    await appendToSheet({
      spreadsheetId: cleaned,
      range: `${cleanedSheetName}!A:A`,
      values: validRowsToAppend,
    });

    console.log(`   Appended ${validRowsToAppend.length} rows`);
  }

  /* -------- Delete consumed rows -------- */

  if (consumedRows === 0) return;

  const sheetId = await getSheetId(unclean, sheetName);
  if (sheetId !== null) {
    await deleteRows(unclean, sheetId, 1, 1 + consumedRows);
    console.log(`   Removed ${consumedRows} processed rows`);
  }
}

/* ------------------------------ ENTRY POINT ------------------------------- */

async function processSheet(type: "B2B" | "B2C") {
  console.log(`Starting data cleaning for ${type}...`);

  const sheetNames = await getAllSheetNames(CONFIG[type].unclean);

  for (const sheetName of sheetNames) {
    try {
      await processSingleSheet(type, sheetName);
    } catch (err) {
      console.error(`❌ Error processing ${sheetName}`, err);
    }
  }
}

async function ensureCleanedHeaders(
  cleanedSheetId: string,
  uncleanHeaders: string[]
) {
  // Resolve actual first tab name dynamically
  const sheetNames = await getAllSheetNames(cleanedSheetId);
  const tabName = sheetNames[0] || "Sheet1";

  const cleanedHeaderRow = (
    await getSheetData(cleanedSheetId, `${tabName}!A1:Z1`)
  )[0];

  const isEmpty =
    !cleanedHeaderRow ||
    cleanedHeaderRow.length === 0 ||
    cleanedHeaderRow.every((c) => !c);

  if (isEmpty) {
    console.log("Cleaned sheet empty, adding headers");
    await appendToSheet({
      spreadsheetId: cleanedSheetId,
      range: `${tabName}!A1`,
      values: [uncleanHeaders],
    });
  }
}

export async function runB2BCleaningJob() {
  try {
    console.log("🚀 Starting B2B cleaning job...");
    await processSheet("B2B");
    console.log("✅ B2B cleaning job completed.");
  } catch (error) {
    console.error("❌ B2B cleaning job failed:", error);
  }
}

export async function runB2CCleaningJob() {
  try {
    console.log("🚀 Starting B2C cleaning job...");
    await processSheet("B2C");
    console.log("✅ B2C cleaning job completed.");
  } catch (error) {
    console.error("❌ B2C cleaning job failed:", error);
  }
}
