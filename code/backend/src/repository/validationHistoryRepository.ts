import { ObjectId } from "mongodb";
import { getDB } from "../database/db";

export type ValidationType = "single" | "bulk" | "csv";

export interface ValidationHistory {
  id: string;
  userId: string;
  phoneType: "B2B" | "B2C";
  type: ValidationType;
  filePath: string;
  total: number;
  valid?: number;
  invalid?: number;
  unknown?: number;
  createdAt: string;
}

export interface CreateValidationHistoryDto {
  userId: string;
  phoneType: "B2B" | "B2C";
  type: ValidationType;
  filePath: string;
  total: number;
  valid: number;
  invalid: number;
  unknown: number;
}

export class ValidationHistoryRepository {
  private getCollection() {
    return getDB().collection("validation_histories");
  }

  async create(data: CreateValidationHistoryDto): Promise<ValidationHistory> {
    const doc = { ...data, createdAt: new Date() };
    const result = await this.getCollection().insertOne(doc);
    return this.mapDocumentToEntity({ ...doc, _id: result.insertedId });
  }

  async findByUserId(userId: string): Promise<ValidationHistory[]> {
    const docs = await this.getCollection()
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
    return docs.map((doc) => this.mapDocumentToEntity(doc));
  }

  async findByIdForUser(
    id: string,
    userId: string
  ): Promise<ValidationHistory | null> {
    if (!ObjectId.isValid(id)) return null;
    const doc = await this.getCollection().findOne({
      _id: new ObjectId(id),
      userId,
    });
    return doc ? this.mapDocumentToEntity(doc) : null;
  }

  /** Sum of numbers validated by a user, used for free-tier accounting. */
  async countValidatedByUser(userId: string): Promise<number> {
    const [row] = await this.getCollection()
      .aggregate([
        { $match: { userId } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ])
      .toArray();
    return row?.total ?? 0;
  }

  private mapDocumentToEntity(doc: any): ValidationHistory {
    return {
      id: doc._id.toString(),
      userId: doc.userId,
      phoneType: doc.phoneType,
      type: doc.type,
      filePath: doc.filePath,
      total: doc.total ?? 0,
      valid: doc.valid,
      invalid: doc.invalid,
      unknown: doc.unknown,
      createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
    };
  }
}

export const validationHistoryRepository = new ValidationHistoryRepository();
