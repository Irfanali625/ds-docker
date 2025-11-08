export enum SubscriptionPlan {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM'
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  PENDING = 'PENDING'
}

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserUsage {
  freeValidationsUsed: number;
  freeValidationsRemaining: number;
  hasActiveSubscription: boolean;
  subscriptionEndDate?: string;
  subscriptionPlan?: SubscriptionPlan;
}

export interface ValidationLimit {
  canValidate: boolean;
  remainingFree: number;
  hasActiveSubscription: boolean;
  subscriptionEndDate?: string;
  limitType: 'free' | 'premium' | 'exceeded';
  message?: string;
}

export interface SubscriptionStatusResponse {
  usage: UserUsage;
  limit: ValidationLimit;
  premiumPrice: number;
}

