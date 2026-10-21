import fs from "fs";
import path from "path";
import { Response } from "express";
import csvParser from "csv-parser";
import { Readable } from "stream";
import {
  validatePhoneNumber,
  validateBulkPhoneNumbers,
  normalizePhoneNumber,
  looksLikePhoneNumber,
} from "../services/phoneValidationService";
import { AuthRequest } from "../middleware/auth";
import {
  saveValidationResults,
  LOCAL_UPLOADS_DIR,
  PhoneType,
} from "../utils/saveValidationResults";
import {
  validationHistoryRepository,
  ValidationType,
} from "../repository/validationHistoryRepository";
import { SubscriptionService } from "../services/subscriptionService";
import { getFile } from "../lib/seaweedfs";
import { PhoneValidationResult } from "../types/phoneValidation";

export const MAX_BULK_NUMBERS = 1000;
export const MAX_CSV_ROWS = 10000;

// Free-tier limits are switched off until subscriptions launch.
const ENFORCE_LIMITS = process.env.ENFORCE_VALIDATION_LIMITS === "true";

const PHONE_HEADER_KEYWORDS = ["phone", "mobile", "cell", "tel", "number", "contact"];

class RequestError extends Error {
  constructor(public status: number, message: string, public extra: Record<string, any> = {}) {
    super(message);
  }
}

function parsePhoneType(value: unknown): PhoneType {
  const type = String(value ?? "").toUpperCase();
  if (type !== "B2B" && type !== "B2C") {
    throw new RequestError(400, "Type must be B2B or B2C");
  }
  return type;
}

/** Drops blanks and duplicates (by normalized number) while keeping input order. */
function prepareNumbers(raw: unknown[]): { numbers: string[]; duplicates: number } {
  const seen = new Set<string>();
  const numbers: string[] = [];
  let duplicates = 0;

  for (const value of raw) {
    const phone = String(value ?? "").trim();
    if (!phone) continue;
    const key = normalizePhoneNumber(phone) || phone;
    if (seen.has(key)) {
      duplicates++;
      continue;
    }
    seen.add(key);
    numbers.push(phone);
  }

  return { numbers, duplicates };
}

async function assertWithinLimit(userId: string, requested: number) {
  if (!ENFORCE_LIMITS) return;

  const limit = await SubscriptionService.getValidationLimit(userId);
  if (limit.limitType === "premium") return;

  if (limit.remainingFree < requested) {
    throw new RequestError(
      403,
      limit.remainingFree === 0
        ? "You have used all of your free validations. Upgrade to continue."
        : `You have ${limit.remainingFree} free validations left and requested ${requested}. Upgrade to continue.`,
      { requiresUpgrade: true, remainingFree: limit.remainingFree, requested }
    );
  }
}

function readCsvRows(buffer: Buffer): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    const rows: string[][] = [];
    Readable.from(buffer)
      .pipe(csvParser({ headers: false }))
      .on("data", (row: Record<string, string>) => {
        rows.push(Object.values(row).map((v) => String(v ?? "").trim()));
        if (rows.length > MAX_CSV_ROWS + 1) {
          reject(new RequestError(400, `CSV files can contain at most ${MAX_CSV_ROWS.toLocaleString()} rows`));
        }
      })
      .on("end", () => resolve(rows))
      .on("error", () => reject(new RequestError(400, "Could not read the CSV file")));
  });
}

/**
 * Picks the phone column: a header cell that names a phone column, otherwise the
 * first column. A header row is skipped either way since it is not a number.
 */
function extractPhoneColumn(rows: string[][]): { values: string[]; skipped: number } {
  if (!rows.length) return { values: [], skipped: 0 };

  const header = rows[0].map((h) => h.toLowerCase());
  const headerIndex = header.findIndex((h) =>
    PHONE_HEADER_KEYWORDS.some((k) => h.includes(k))
  );
  const column = headerIndex === -1 ? 0 : headerIndex;
  const dataRows = headerIndex === -1 ? rows : rows.slice(1);

  const values = dataRows
    .map((row) => row[column] ?? "")
    .filter((value) => looksLikePhoneNumber(value));

  return { values, skipped: dataRows.length - values.length };
}

/** Opens a results file from object storage, falling back to the local copy. */
async function openResultsFile(filePath: string): Promise<NodeJS.ReadableStream | null> {
  try {
    return await getFile(filePath);
  } catch {
    const localPath = path.resolve(LOCAL_UPLOADS_DIR, filePath);
    if (!localPath.startsWith(LOCAL_UPLOADS_DIR + path.sep) || !fs.existsSync(localPath)) {
      return null;
    }
    return fs.createReadStream(localPath);
  }
}

function summarize(results: PhoneValidationResult[]) {
  const valid = results.filter((r) => r.isValid).length;
  const unknown = results.filter((r) => r.status === "UNKNOWN").length;
  return { total: results.length, valid, invalid: results.length - valid - unknown, unknown };
}

function toPublicResult(r: PhoneValidationResult) {
  return {
    phoneNumber: r.phoneNumber,
    isValid: r.isValid,
    status: r.status,
    isReachable: r.isReachable,
    countryCode: r.countryCode,
    formattedNumber: r.formattedNumber,
    nationalFormat: r.nationalFormat,
    error: r.error,
    validatedAt: r.validatedAt,
  };
}

function sendError(res: Response, error: any, fallback: string) {
  if (error instanceof RequestError) {
    return res.status(error.status).json({ error: error.message, ...error.extra });
  }
  console.error(`${fallback}:`, error);
  return res.status(500).json({ error: fallback });
}

export class PhoneValidationController {
  private async run(
    req: AuthRequest,
    res: Response,
    type: ValidationType,
    numbers: string[],
    meta: Record<string, number> = {}
  ) {
    const userId = req.user!.id;
    const phoneType = parsePhoneType(req.body?.phoneType);

    await assertWithinLimit(userId, numbers.length);

    const results =
      type === "single"
        ? [await validatePhoneNumber(numbers[0])]
        : await validateBulkPhoneNumbers(numbers);

    const counts = summarize(results);
    const saved = await saveValidationResults({ phoneType, results });

    const history = await validationHistoryRepository.create({
      userId,
      phoneType,
      type,
      filePath: saved.publicPath,
      ...counts,
    });

    return res.json({
      success: true,
      data: {
        historyId: history.id,
        type,
        phoneType,
        ...counts,
        ...meta,
        results: results.map(toPublicResult),
        processedAt: history.createdAt,
        ...(!saved.seaweedfsUploaded && {
          storageWarning: "Results were validated but the file could not be stored remotely.",
        }),
      },
    });
  }

  async validateSingle(req: AuthRequest, res: Response) {
    try {
      const phoneNumber = String(req.body?.phoneNumber ?? "").trim();
      if (!phoneNumber) throw new RequestError(400, "Phone number is required");
      return await this.run(req, res, "single", [phoneNumber]);
    } catch (error) {
      return sendError(res, error, "Failed to validate phone number");
    }
  }

  async validateBulk(req: AuthRequest, res: Response) {
    try {
      const raw = req.body?.phoneNumbers;
      if (!Array.isArray(raw)) {
        throw new RequestError(400, "Phone numbers array is required");
      }

      const { numbers, duplicates } = prepareNumbers(raw);
      if (!numbers.length) {
        throw new RequestError(400, "Enter at least one phone number");
      }
      if (numbers.length > MAX_BULK_NUMBERS) {
        throw new RequestError(
          400,
          `Bulk validation accepts up to ${MAX_BULK_NUMBERS.toLocaleString()} numbers. Use CSV upload for larger lists.`
        );
      }

      return await this.run(req, res, "bulk", numbers, { duplicatesRemoved: duplicates });
    } catch (error) {
      return sendError(res, error, "Failed to validate phone numbers");
    }
  }

  async validateCSV(req: AuthRequest, res: Response) {
    try {
      if (!req.file) throw new RequestError(400, "CSV file is required");

      const rows = await readCsvRows(req.file.buffer);
      const { values, skipped } = extractPhoneColumn(rows);
      const { numbers, duplicates } = prepareNumbers(values);

      if (!numbers.length) {
        throw new RequestError(400, "No phone numbers found in the CSV file");
      }

      return await this.run(req, res, "csv", numbers, {
        duplicatesRemoved: duplicates,
        rowsSkipped: skipped,
      });
    } catch (error) {
      return sendError(res, error, "Failed to process CSV file");
    }
  }

  async getHistory(req: AuthRequest, res: Response) {
    try {
      const history = await validationHistoryRepository.findByUserId(req.user!.id);
      return res.json(history);
    } catch (error) {
      return sendError(res, error, "Failed to fetch validation history");
    }
  }

  async downloadHistoryFile(req: AuthRequest, res: Response) {
    try {
      const record = await validationHistoryRepository.findByIdForUser(
        req.params.id,
        req.user!.id
      );
      if (!record?.filePath) throw new RequestError(404, "File not found");

      const stream = await openResultsFile(record.filePath);
      if (!stream) throw new RequestError(404, "File not found");

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${path.basename(record.filePath)}"`
      );
      stream.on("error", () => res.destroy());
      return stream.pipe(res);
    } catch (error) {
      return sendError(res, error, "Failed to download file");
    }
  }
}
