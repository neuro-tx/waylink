import { PlanTier, SubscriptionStatus } from "./all-types";

export interface SubscriptionRow {
  id: string;
  providerId: string;
  planId: string;
  planName: string;
  planTier: PlanTier;
  planPrice: number;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  type: "trial" | "paid" | null;
  listingsCount: number;
  autoRenew: boolean;
  pausedAt: Date | null;
  resumeAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionsFilters {
  status?: SubscriptionStatus;
  planId?: string;
  type?: "trial" | "paid";
  page?: number;
  perPage?: number;
}

export interface SubscriptionsAnalytics {
  totalSubscriptions: number;
  activeCount: number;
  trialingCount: number;
  pausedCount: number;
  cancelledCount: number;
  expiredCount: number;
  mrr: number;
  trialConversionRate: number;
  churnRate: number;
  mrrTrend: { month: string; mrr: number; newMrr: number }[];
  planDistribution: { planName: string; planTier: string; count: number }[];
}
