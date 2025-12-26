import { google } from "googleapis";
import path from "path";

const auth = new google.auth.GoogleAuth({
  keyFile: path.resolve(process.cwd(), "src/services/json/google-service-account.json"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

export async function getSheetData(spreadsheetId: string, range: string) {
  const sheets = google.sheets({ version: "v4", auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });
  return response.data.values || [];
}

export async function appendToSheet({
  spreadsheetId,
  range,
  values,
}: {
  spreadsheetId: string;
  range: string;
  values: any[][];
}) {
  const sheets = google.sheets({
    version: "v4",
    auth,
  });

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values,
    },
  });

  return true;
}

export async function deleteRows(spreadsheetId: string, sheetId: number, startIndex: number, endIndex: number) {
  const sheets = google.sheets({ version: "v4", auth });
  
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex,
              endIndex,
            },
          },
        },
      ],
    },
  });
}

export async function getSheetMetadata(spreadsheetId: string) {
  const sheets = google.sheets({ version: "v4", auth });
  const response = await sheets.spreadsheets.get({
    spreadsheetId,
  });
  return response.data;
}
