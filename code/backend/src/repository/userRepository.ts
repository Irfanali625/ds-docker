import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import { User, CreateUserDto } from "../types";
import { getDB } from "../database/db";

const BCRYPT_ROUNDS = 10;

export class DuplicateEmailError extends Error {
  constructor() {
    super("An account with this email already exists");
  }
}

export interface UpdateUserDto {
  id: string;
  name: string;
  email: string;
  password?: string;
}

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export class UserRepository {
  private getCollection() {
    return getDB().collection("users");
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.getCollection().findOne({ email: normalizeEmail(email) });
    return user ? this.mapDocumentToUser(user) : null;
  }

  async findById(id: string): Promise<User | null> {
    if (!ObjectId.isValid(id)) return null;
    const user = await this.getCollection().findOne({ _id: new ObjectId(id) });
    return user ? this.mapDocumentToUser(user) : null;
  }

  async update(userData: UpdateUserDto): Promise<User> {
    const email = normalizeEmail(userData.email);
    const existingUser = await this.findByEmail(email);

    if (existingUser && existingUser.id !== userData.id) {
      throw new DuplicateEmailError();
    }

    const updateFields: Record<string, any> = {
      name: userData.name.trim(),
      email,
      updatedAt: new Date(),
    };

    if (userData.password) {
      updateFields.password = await bcrypt.hash(userData.password, BCRYPT_ROUNDS);
    }

    const result = await this.getCollection().updateOne(
      { _id: new ObjectId(userData.id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      throw new Error("User not found");
    }

    return (await this.findById(userData.id))!;
  }

  async create(userData: CreateUserDto): Promise<User> {
    const email = normalizeEmail(userData.email);
    if (await this.findByEmail(email)) {
      throw new DuplicateEmailError();
    }

    const user = {
      email,
      name: userData.name.trim(),
      password: await bcrypt.hash(userData.password, BCRYPT_ROUNDS),
      createdAt: new Date(),
    };

    try {
      const result = await this.getCollection().insertOne(user);
      return this.mapDocumentToUser({ ...user, _id: result.insertedId });
    } catch (error: any) {
      // Unique index on email catches concurrent sign-ups with the same address.
      if (error?.code === 11000) throw new DuplicateEmailError();
      throw error;
    }
  }

  /** Returns the user (without the password hash) when the credentials match. */
  async verifyPassword(email: string, password: string): Promise<User | null> {
    const userDoc = await this.getCollection().findOne({ email: normalizeEmail(email) });
    if (!userDoc?.password) return null;

    const isValid = await bcrypt.compare(password, userDoc.password);
    return isValid ? this.mapDocumentToUser(userDoc) : null;
  }

  async verifyPasswordById(id: string, password: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    const userDoc = await this.getCollection().findOne({ _id: new ObjectId(id) });
    if (!userDoc?.password) return false;
    return bcrypt.compare(password, userDoc.password);
  }

  private mapDocumentToUser(doc: any): User {
    return {
      id: doc._id.toString(),
      email: doc.email,
      name: doc.name,
      createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
    };
  }
}

export const userRepository = new UserRepository();
