export enum ContactType {
  B2B = 'B2B',
  B2C = 'B2C'
}

export enum ContactPhase {
  RAW = 'RAW',
  CLEANED = 'CLEANED',
  DELIVERING = 'DELIVERING',
  DELIVERED = 'DELIVERED'
}

export interface Contact {
  id: string;
  type: ContactType;
  phase: ContactPhase;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  website?: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
}

export interface UserRecord {
  id: string;
  userId: string;
  contactId: string;
  phase: ContactPhase;
  deliveredAt: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
