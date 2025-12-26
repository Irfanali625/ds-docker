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

function findPhoneColumnIndex(headers: string[]): number {
  const phoneKeywords = ["phone", "mobile", "contact", "cell", "tel"];
  const index = headers.findIndex((h) =>
    phoneKeywords.some((keyword) => h.toLowerCase().includes(keyword))
  );
  return index !== -1 ? index : -1
}

async function getSheetId(spreadsheetId: string, title: string): Promise<number | null> {
    const metadata = await getSheetMetadata(spreadsheetId);
    const sheet = metadata.sheets?.find((s: any) => s.properties.title === title);
    return sheet?.properties?.sheetId || null;
}

async function processSheet(type: "B2B" | "B2C") {
  const { unclean, cleaned } = CONFIG[type];
  console.log(`Starting data cleaning for ${type}...`);

  const uncleanHeaders = (await getSheetData(unclean, "Sheet1!A1:Z1"))[0];
  if (!uncleanHeaders) {
    console.log(`No headers found for ${type} Unclean sheet.`);
    return;
  }

  const phoneColIndex = findPhoneColumnIndex(uncleanHeaders);
   if (phoneColIndex === -1) {
    console.log(`Could not find a 'Phone' column in ${type} headers:`, uncleanHeaders);
    return;
  }
  console.log(`Found phone column at index ${phoneColIndex}: ${uncleanHeaders[phoneColIndex]}`);

  const cleanedData = await getSheetData(cleaned, "Sheet1!A2:Z");
  const existingPhones = new Set<string>();

  const cleanedHeaders = (await getSheetData(cleaned, "Sheet1!A1:Z1"))[0];
  const cleanedPhoneColIndex = findPhoneColumnIndex(cleanedHeaders || uncleanHeaders);

  cleanedData.forEach((row) => {
    if (row[cleanedPhoneColIndex]) {
       const p = String(row[cleanedPhoneColIndex]).replace(/\D/g, "");
       if(p) existingPhones.add(p);
    }
  });

  console.log(`Found ${existingPhones.size} existing unique records in ${type} Cleaned sheet.`);

  const range = `Sheet1!A2:Z${BATCH_SIZE + 1}`;
  const rowsToProcess = await getSheetData(unclean, range);

  if (!rowsToProcess || rowsToProcess.length === 0) {
    console.log(`No more data to process in ${type} Unclean sheet.`);
    return;
  }

  console.log(`Processing ${rowsToProcess.length} rows from ${type}...`);

  const validRowsToAppend: any[][] = [];
  
  for (const row of rowsToProcess) {
    const rawPhone = row[phoneColIndex];
    if (!rawPhone) {
        continue;
    }

    const validation = await validatePhoneNumber(rawPhone);

    if (validation.isValid) {
      if (!existingPhones.has(validation.phoneNumber)) {
         const newRow = [...row];
         newRow[phoneColIndex] = validation.formattedNumber || validation.phoneNumber; 
         
         validRowsToAppend.push(newRow);
         existingPhones.add(validation.phoneNumber);
      } else {
          console.log(`Duplicate found: ${rawPhone}`);
      }
    } else {
        console.log(`Invalid number: ${rawPhone}`);
    }
  }

  if (validRowsToAppend.length > 0) {
    await appendToSheet({
      spreadsheetId: cleaned,
      range: "Sheet1!A:A",
      values: validRowsToAppend,
    });
    console.log(`Appended ${validRowsToAppend.length} valid rows to ${type} Cleaned.`);
  }

  const sheetId = await getSheetId(unclean, "Sheet1");
  
  if (sheetId !== null) { 
      await deleteRows(unclean, sheetId, 1, 1 + rowsToProcess.length);
      console.log(`Deleted ${rowsToProcess.length} processed rows from ${type} Unclean.`);
  } else {
      console.error(`Could not find Sheet1 GID for ${type} Unclean. Cannot delete rows.`);
  }
}

export async function runDataCleaningJob() {
  try {
    await processSheet("B2B");
    await processSheet("B2C");
    console.log("Data cleaning job completed.");
  } catch (error) {
    console.error("Error in data cleaning job:", error);
  }
}
