import {
  getSheetData,
  appendToSheet,
  deleteRows,
  getSheetMetadata,
} from "../lib/googleSheets";
import { validatePhoneNumber } from "./phoneValidationService";

const CONFIG = {
  B2B: {
    unclean: "1a9pOvHfzbUw11GKLwuykfSBDc4AMWfvdgYc3VAm7-OY",
    cleaned: "1Fn1PiTEPft_FXvVjw1K9uQ-pK8khMiwk-nGP9Y3cnT8",
  },
  B2C: {
    unclean: "14rDA6fSGMc89Bla3vZj8zF6B-IjbcgLoCnaJqBT600A",
    cleaned: "1lZIdz0QLXf_W5fKWWtZEn6AwROyEfrBD5fviaQqnRUI",
  },
};

const BATCH_SIZE = 50;

/* -------------------------------- HELPERS -------------------------------- */

function findPhoneColumnIndex(headers: string[]): number {
  const phoneKeywords = ["phone", "phone number", "mobile", "contact", "cell", "tel"];
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
    metadata.sheets
      ?.map((s) => s.properties?.title)
      .filter(Boolean) as string[]
  ) || [];
}

/* -------------------------- CORE PER-SHEET LOGIC -------------------------- */

async function processSingleSheet(
  type: "B2B" | "B2C",
  sheetName: string
) {
  const { unclean, cleaned } = CONFIG[type];

  console.log(`➡ Processing ${type} → ${sheetName}`);

  /* -------- Headers -------- */

  const uncleanHeaders = (
    await getSheetData(unclean, `${sheetName}!A1:Z1`)
  )[0];

  if (!uncleanHeaders || uncleanHeaders.length === 0) {
    console.log(`⚠ No headers in ${sheetName}, skipping`);
    return;
  }

  const phoneColIndex = findPhoneColumnIndex(uncleanHeaders);
  if (phoneColIndex === -1) {
    console.log(`⚠ No phone column in ${sheetName}, skipping`);
    return;
  }

  /* -------- Existing cleaned phones -------- */

  const cleanedHeaders = (
    await getSheetData(cleaned, "Sheet1!A1:Z1")
  )[0];

  const cleanedPhoneColIndex =
    findPhoneColumnIndex(cleanedHeaders || uncleanHeaders);

  const cleanedData = await getSheetData(cleaned, "Sheet1!A2:Z");
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

  const validRowsToAppend: any[][] = [];

  for (const row of rowsToProcess) {
    const rawPhone = row[phoneColIndex];
    if (!rawPhone) continue;

    const validation = await validatePhoneNumber(rawPhone);

    if (!validation.isValid) continue;

    if (existingPhones.has(validation.phoneNumber)) continue;

    const newRow = [...row];
    newRow[phoneColIndex] =
      validation.formattedNumber || validation.phoneNumber;

    validRowsToAppend.push(newRow);
    existingPhones.add(validation.phoneNumber);
  }

  /* -------- Append -------- */

  if (validRowsToAppend.length > 0) {
    await appendToSheet({
      spreadsheetId: cleaned,
      range: "Sheet1!A:A",
      values: validRowsToAppend,
    });

    console.log(`   ✅ Appended ${validRowsToAppend.length} rows`);
  }

  /* -------- Delete processed rows -------- */

  const sheetId = await getSheetId(unclean, sheetName);
  if (sheetId !== null) {
    await deleteRows(unclean, sheetId, 1, 1 + rowsToProcess.length);
    console.log(`   🗑 Deleted processed rows`);
  }
}

/* ------------------------------ ENTRY POINT ------------------------------- */

async function processSheet(type: "B2B" | "B2C") {
  console.log(`Starting data cleaning for ${type}...`);

  if (type === "B2B") {
    await processSingleSheet("B2B", "Sheet1");
    return;
  }

  // B2C → process ALL sheets
  const sheetNames = await getAllSheetNames(CONFIG.B2C.unclean);

  for (const sheetName of sheetNames) {
    try {
      await processSingleSheet("B2C", sheetName);
    } catch (err) {
      console.error(`❌ Error processing ${sheetName}`, err);
    }
  }
}

export async function runDataCleaningJob() {
  try {
    await processSheet("B2B");
    await processSheet("B2C");
    console.log("✅ Data cleaning job completed.");
  } catch (error) {
    console.error("❌ Data cleaning job failed:", error);
  }
}
